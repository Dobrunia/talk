import {
  Router,
  MediaKind,
} from 'mediasoup/node/lib/types';
import { Socket } from 'socket.io';
import {
  clients,
  addUserToChannel,
  usersByChannels,
} from '../data.ts';
import dotenv from 'dotenv';
import { getWorker } from './worker.ts';
import { OPTIONS } from './options.ts';

dotenv.config();

const consM = `\x1b[33mmediasoup\x1b[0m `;

const roomRouters = new Map<string, Router>(); // New map to store routers for each room

export async function handleMediasoupRequest(
  socket: Socket,
  data: any,
  callback: (response: any) => void,
) {
  const { type, payload } = data;
  console.error(`${consM}handleMediasoupRequest get type: ${type}`);
  try {
    let response;
    switch (type) {
      case 'joinRoom':
        response = await joinRoom(socket, payload.roomName, callback);
        break;
      case 'createTransport':
        response = await createWebRtcTransport(socket, callback);
        break;
      case 'connectTransport':
        response = await connectTransport(
          socket,
          payload.transportId,
          payload.dtlsParameters,
        );
        callback(response);
        break;
      case 'produce':
        response = await produce(
          socket,
          payload.transportId,
          payload.kind,
          payload.rtpParameters,
        );
        callback(response);
        break;
      case 'consume':
        response = await consume(
          socket,
          payload.producerId,
          payload.rtpCapabilities,
        );
        callback(response);
        break;
      case 'resumeConsumer':
        await resumeConsumer(socket, payload.serverConsumerId);
        callback({ resumed: true });
        break;
      default:
        console.warn(`Unknown mediasoup action type: ${type}`);
        callback({ error: 'Unknown action type' });
    }
    callback(response);
  } catch (error) {
    console.error(`${consM}Error handling mediasoup action "${type}":`, error);
    callback({ error: `Failed to handle ${type}` });
  }
}

async function joinRoom(
  socket: Socket,
  roomName: string,
  callback: (response: any) => void,
) {
  roomName = String(roomName);
  let router = roomRouters.get(roomName);
  if (!router) {
    router = await createRoom(roomName);
  }
  const clientData = clients.get(socket);
  if (clientData) {
    addUserToChannel(socket, roomName, clientData);
  }
  callback({ rtpCapabilities: router.rtpCapabilities });
}

async function createRoom(roomName: string): Promise<Router> {
  const worker = getWorker();
  const router = await worker.createRouter({
    mediaCodecs: OPTIONS.mediaCodecs,
  });
  roomRouters.set(roomName, router);
  usersByChannels.set(roomName, []);
  return router;
}

async function createWebRtcTransport(
  socket: Socket,
  callback: (response: any) => void,
) {
  const clientData = clients.get(socket);
  if (!clientData || !clientData.currentChannelId) {
    callback({ error: 'Client not part of any room' });
    return;
  }
  const roomName = clientData.currentChannelId;
  const router = roomRouters.get(roomName);
  if (!router) {
    callback({ error: 'Room not found' });
    return;
  }
  const transport = await router.createWebRtcTransport({
    listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  });
  clientData.transports.sendTransport = transport;
  clients.set(socket, clientData);
  callback({
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
  });
}

async function connectTransport(
  socket: Socket,
  transportId: string,
  dtlsParameters: any,
) {
  const clientData = clients.get(socket);
  if (!clientData) {
    throw new Error('Client not found');
  }
  const transport = clientData.transports.sendTransport;
  if (!transport || transport.id !== transportId) {
    throw new Error('Transport not found');
  }
  await transport.connect({ dtlsParameters });
  return { connected: true };
}

async function produce(
  socket: Socket,
  transportId: string,
  kind: MediaKind,
  rtpParameters: any,
) {
  const clientData = clients.get(socket);
  if (!clientData) {
    throw new Error('Client not found');
  }
  const transport = clientData.transports.sendTransport;
  if (!transport || transport.id !== transportId) {
    throw new Error('Transport not found');
  }
  const producer = await transport.produce({ kind, rtpParameters });
  if (kind === 'audio') {
    clientData.producers.audioProducer = producer;
  } else if (kind === 'video') {
    clientData.producers.videoProducer = producer;
  } else if (kind === 'screen') {
    clientData.producers.screenProducer = producer;
  }
  clients.set(socket, clientData);
  return { id: producer.id };
}

async function consume(
  socket: Socket,
  producerId: string,
  rtpCapabilities: any,
) {
  const clientData = clients.get(socket);
  if (!clientData || !clientData.currentChannelId) {
    throw new Error('Client not found or not part of any room');
  }
  const roomName = clientData.currentChannelId;
  const router = roomRouters.get(roomName);
  if (!router) throw new Error('Room not found');
  if (!router.canConsume({ producerId, rtpCapabilities }))
    throw new Error('Cannot consume');

  const recvTransport = clientData.transports.recvTransport;
  if (!recvTransport) throw new Error('Receive transport not found');

  const consumer = await recvTransport.consume({
    producerId,
    rtpCapabilities,
    paused: true,
  });
  clientData.consumers?.push(consumer);
  clients.set(socket, clientData);
  return {
    id: consumer.id,
    producerId,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
  };
}

async function resumeConsumer(socket: Socket, serverConsumerId: string) {
  const clientData = clients.get(socket);
  if (!clientData || !clientData.consumers) {
    throw new Error('Client not found or no consumers available');
  }
  const consumer = clientData.consumers.find((c) => c.id === serverConsumerId);
  if (consumer) await consumer.resume();
}
