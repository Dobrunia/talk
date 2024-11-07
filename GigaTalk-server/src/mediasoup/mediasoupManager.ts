import { Router, MediaKind } from 'mediasoup/node/lib/types';
import { Socket } from 'socket.io';
import {
  clients,
  addUserToChannel,
  usersByChannels,
  getUserCurrentChannelId,
} from '../data.ts';
import dotenv from 'dotenv';
import { getWorker } from './worker.ts';
import { OPTIONS } from './options.ts';
import { joinChannel } from '../socket/messageHandler.ts';

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
  console.error(
    `${consM}handleMediasoupRequest get payload: ${JSON.stringify(
      payload,
      null,
      2,
    )}`,
  );
  try {
    let response;
    switch (type) {
      case 'joinRoom':
        response = await joinMediasoupRoom(socket, payload.roomId, callback);
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
        await produce(
          socket,
          payload.transportId,
          payload.kind,
          payload.rtpParameters,
        );
        break;
      // case 'consume':
      //   response = await consume(
      //     socket,
      //     payload.producerId,
      //     payload.rtpCapabilities,
      //   );
      //   callback(response);
      //   break;
      // case 'resumeConsumer':
      //   await resumeConsumer(socket, payload.serverConsumerId);
      //   callback({ resumed: true });
      //   break;
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

async function joinMediasoupRoom(
  socket: Socket,
  roomId: string,
  callback: (response: any) => void,
) {
  let router = roomRouters.get(roomId);
  if (!router) {
    router = await createRoom(roomId);
  }
  joinChannel(socket, roomId);
  callback({ rtpCapabilities: router.rtpCapabilities });
}

async function createRoom(roomId: string): Promise<Router> {
  const worker = getWorker();
  const router = await worker.createRouter({
    mediaCodecs: OPTIONS.mediaCodecs,
  });
  roomRouters.set(roomId, router);
  //usersByChannels.set(roomId, []);
  return router;
}

async function createWebRtcTransport(
  socket: Socket,
  callback: (response: any) => void,
) {
  const clientData = clients.get(socket);
  if (!clientData) return;
  const chId = getUserCurrentChannelId(clientData);
  if (!chId) {
    console.log('Client not part of any room');
    callback({ error: 'Client not part of any room' });
    return;
  }
  const router = roomRouters.get(chId);
  if (!router) {
    console.log('Room not found');
    callback({ error: 'Room not found' });
    return;
  }

  try {
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }], // Замените на ваш внешний IP при необходимости
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    clientData.transports.sendTransport = transport;
    console.log('Send transport created:', transport.id);
    clientData.transports.recvTransport = transport;
    console.log('Recv transport created:', transport.id);

    clients.set(socket, clientData);

    // Возвращаем параметры созданного транспорта клиенту
    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });
  } catch (error) {
    console.error('Failed to create transport:', error);
    callback({ error: 'Failed to create transport' });
  }
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
  // return { id: producer.id };
  await consume(socket, producer.id);
}

async function consume(socket: Socket, producerId: string) {
  const clientData = clients.get(socket);
  if (!clientData) return;
  const chId = getUserCurrentChannelId(clientData);
  if (!chId) {
    throw new Error('Client not part of any room');
  }
  const router = roomRouters.get(chId);
  if (!router) throw new Error('Room not found');
  if (
    !router.canConsume({ producerId, rtpCapabilities: router.rtpCapabilities })
  )
    throw new Error('Cannot consume');

  const recvTransport = clientData.transports.recvTransport;
  if (!recvTransport) throw new Error('Receive transport not found');

  const consumer = await recvTransport.consume({
    producerId,
    rtpCapabilities: router.rtpCapabilities,
    paused: true,
  });
  clientData.consumers?.push(consumer);// сохраняю чтобы что?
  clients.set(socket, clientData);
  const data = {
    id: consumer.id,
    producerId,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
  };
  socket.emit('consume', data);
  //TODO:: Что дальше?
  socket.on('consumer-resume', async (consumerId: string) => {
    if (consumer.id === consumerId) {
      await consumer.resume();
      console.log(`Consumer ${consumerId} resumed`);
    }
  });
}

async function resumeConsumer(socket: Socket, serverConsumerId: string) {
  const clientData = clients.get(socket);
  if (!clientData || !clientData.consumers) {
    throw new Error('Client not found or no consumers available');
  }
  const consumer = clientData.consumers.find((c) => c.id === serverConsumerId);
  if (consumer) await consumer.resume();
}
