import {
  Router,
  MediaKind,
  DtlsParameters,
  RtpParameters,
  RtpCapabilities,
} from 'mediasoup/node/lib/types';
import { Socket } from 'socket.io';
import { clients, usersByChannels, getUserCurrentChannelId } from '../data.ts';
import dotenv from 'dotenv';
import { getWorker } from './worker.ts';
import { OPTIONS } from './options.ts';
import { joinChannel } from '../socket/messageHandler.ts';

dotenv.config();

const mmedia = `\x1b[33mmediasoup\x1b[0m `;

export const roomRouters = new Map<string, Router>(); // New map to store routers for each room //TODO: написать выход из канала

export async function handleMediasoupRequest(
  socket: Socket,
  data: any,
  callback: (response: any) => void,
) {
  const { type, payload } = data;
  console.error(`${mmedia}handleMediasoupRequest get type: ${type}`);
  // console.error(
  //   `${mmedia}handleMediasoupRequest get payload: ${JSON.stringify(
  //     payload,
  //     null,
  //     2,
  //   )}`,
  // );
  try {
    switch (type) {
      case 'joinRoom':
        await joinMediasoupRoom(socket, payload.roomId, callback);
        break;
      case 'createSendTransport':
        await createSendWebRtcTransport(socket, callback);
        break;
      case 'createRecvTransport':
        await createRecvWebRtcTransport(socket, callback);
        break;
      case 'connectTransport':
        await connectTransport(
          socket,
          payload.transportId,
          payload.dtlsParameters,
          callback,
        );
        break;
      case 'produce':
        await produce(socket, payload.kind, payload.rtpParameters, callback);
        break;
      case 'createConsumersForClient':
        createConsumersForClient(socket, payload.rtpCapabilities);
        break;
      case 'createConsumersForNewProducer':
        createConsumersForNewProducer(
          socket,
          payload.producerId,
          payload.rtpCapabilities,
        );
        break;
      default:
        console.warn(`Unknown mediasoup action type: ${type}`);
        callback({ error: 'Unknown action type' });
    }
  } catch (error) {
    console.error(`${mmedia}Error handling mediasoup action "${type}":`, error);
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
    router = await createRoomRouter(roomId);
  }
  joinChannel(socket, roomId);
  callback({ rtpCapabilities: router.rtpCapabilities });
}

async function createRoomRouter(roomId: string): Promise<Router> {
  const worker = getWorker();
  const router = await worker.createRouter({
    mediaCodecs: OPTIONS.mediaCodecs,
  });
  roomRouters.set(roomId, router);
  return router;
}
async function createSendWebRtcTransport(
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
    // Create sendTransport for the client to send media
    const sendTransport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }], // Adjust as needed
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    // Store both transports in clientData
    clientData.transports.sendTransport = sendTransport;
    console.log('Send transport created:', sendTransport.id);

    // Add client data to the clients map
    clients.set(socket, clientData);

    // Return transport parameters to the client
    callback({
      id: sendTransport.id,
      iceParameters: sendTransport.iceParameters,
      iceCandidates: sendTransport.iceCandidates,
      dtlsParameters: sendTransport.dtlsParameters,
    });
  } catch (error) {
    console.error('Failed to create transport:', error);
    callback({ error: 'Failed to create transport' });
  }
}

async function createRecvWebRtcTransport(
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
    // Create recvTransport for receiving media from the client
    const recvTransport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }], // Adjust as needed
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    clientData.transports.recvTransport = recvTransport;
    console.log('Recv transport created:', recvTransport.id);

    // Add client data to the clients map
    clients.set(socket, clientData);

    // Return transport parameters to the client
    callback({
      id: recvTransport.id,
      iceParameters: recvTransport.iceParameters,
      iceCandidates: recvTransport.iceCandidates,
      dtlsParameters: recvTransport.dtlsParameters,
    });
  } catch (error) {
    console.error('Failed to create transport:', error);
    callback({ error: 'Failed to create transport' });
  }
}

async function connectTransport(
  socket: Socket,
  transportId: string,
  dtlsParameters: DtlsParameters,
  callback: (response: any) => void,
) {
  console.log(`Transport ${transportId} connecting...`);

  const clientData = clients.get(socket);
  if (!clientData) {
    console.error('Client data not found for transport');
    callback({ error: 'Client not found' });
    return;
  }

  // Determine which transport to connect: sendTransport or recvTransport
  const sendTransport = clientData.transports.sendTransport;
  const recvTransport = clientData.transports.recvTransport;

  let transportToConnect;

  // If it's a sendTransport
  if (sendTransport && sendTransport.id === transportId) {
    transportToConnect = sendTransport;
  }
  // If it's a recvTransport
  else if (recvTransport && recvTransport.id === transportId) {
    transportToConnect = recvTransport;
  }

  if (!transportToConnect) {
    console.error(`Transport with ID ${transportId} not found`);
    callback({ error: 'Transport not found' });
    return;
  }

  // Check if transport has already been connected (you might want to add an 'isConnected' flag)
  if (transportToConnect.appData?.isConnected) {
    console.warn(`Transport ${transportId} already connected`);
    callback({ error: 'Transport already connected' });
    return;
  }

  try {
    // Connect the transport
    await transportToConnect.connect({ dtlsParameters });

    // Mark the transport as connected
    transportToConnect.appData = transportToConnect.appData || {};
    transportToConnect.appData.isConnected = true;

    console.log(`Transport ${transportId} connected successfully`);

    callback({ connected: true });
  } catch (error) {
    console.error(`Failed to connect transport ${transportId}:`, error);
    callback({ error: 'Failed to connect transport' });
  }
}

async function produce(
  socket: Socket,
  kind: MediaKind,
  rtpParameters: RtpParameters,
  callback: (response: any) => void,
) {
  const clientData = clients.get(socket);
  if (!clientData) {
    throw new Error('Client not found');
  }

  const transport = clientData.transports.sendTransport;
  if (!transport) {
    throw new Error('Transport not found');
  }

  // Create producer
  const producer = await transport.produce({ kind, rtpParameters });

  // Store producer in client data
  if (kind === 'audio') {
    clientData.producers.audioProducer = producer;
  } else if (kind === 'video') {
    clientData.producers.videoProducer = producer;
  }

  clients.set(socket, clientData);

  // Notify other clients in the room
  const roomId = getUserCurrentChannelId(clientData);
  let router = roomRouters.get(roomId!);

  // Handle producer lifecycle
  producer.on('transportclose', () => {
    console.log(`Producer ${producer.id} closed due to transport closure`);
  });

  producer.on('@close', () => {
    console.log(`Producer ${producer.id} closed`);
  });
  callback({ id: producer.id, rtpCapabilities: router?.rtpCapabilities });
}

async function createConsumersForClient(
  socket: Socket,
  rtpCapabilities: RtpCapabilities,
) {
  const clientData = clients.get(socket);
  if (!clientData) {
    console.error('Client not found');
    return;
  }

  const roomId = getUserCurrentChannelId(clientData);
  if (!roomId) {
    console.error('Room not found');
    return;
  }

  const recvTransport = clientData.transports.recvTransport;
  if (!recvTransport) {
    console.error('Receive transport not found');
    return;
  }

  const usersInChannel = usersByChannels.get(roomId);

  if (!usersInChannel) {
    console.error('Users in room not found');
    return;
  }
  console.log('Consumer creation for new client:', clientData.userId);
  for (const user of usersInChannel) {
    console.log('Consumer creation for user producers:', user.userId);
    if (user.userId === clientData.userId) {
      console.log('Skipping self');
      continue;
    }
    for (const producer of Object.values(user.producers)) {
      if (!producer) continue;
      let router = roomRouters.get(roomId);

      if (
        router &&
        !router.canConsume({ producerId: producer.id, rtpCapabilities })
      ) {
        console.warn(`Cannot consume producer with ID ${producer.id}`);
        continue;
      }

      try {
        const consumer = await recvTransport.consume({
          producerId: producer.id,
          rtpCapabilities,
          paused: false,
        });

        socket.emit('newConsumer', {
          consumerUserId: clientData.userId,
          producerUserId: user.userId,
          id: consumer.id,
          producerId: producer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });

        consumer.on('transportclose', () => {
          console.log(`Transport closed for consumer ${consumer.id}`);
        });

        consumer.on('producerclose', () => {
          console.log(`Producer closed; closing consumer ${consumer.id}`);
          consumer.close();
        });

        if (!clientData.consumers) {
          clientData.consumers = [];
        }
        clientData.consumers.push(consumer);
        clients.set(socket, clientData);
      } catch (error) {
        console.error(
          `Error creating consumer for producer ${producer.id}:`,
          error,
        );
      }
    }
  }
}

async function createConsumersForNewProducer(
  socket: Socket,
  producerId: string,
  rtpCapabilities: RtpCapabilities,
) {
  const clientData = clients.get(socket);
  if (!clientData) {
    console.error('Client not found');
    return;
  }

  const roomId = getUserCurrentChannelId(clientData);
  if (!roomId) {
    console.error('Room not found');
    return;
  }

  const usersInChannel = usersByChannels.get(roomId);

  if (!usersInChannel) {
    console.error('Users in room not found');
    return;
  }
  const router = roomRouters.get(roomId);
  const currentUser = usersInChannel.find(
    (user) => user.userId === clientData.userId,
  );
  if (!currentUser) {
    console.error('currentUser is not found');
    return;
  }
  console.log('Consumer creation for new producer:', currentUser.userId);
  for (const user of usersInChannel) {
    console.log('Consumer creation for user:', user.userId);
    if (user.userId === clientData.userId) {
      console.log('Skipping self');
      continue;
    }
    for (const producer of Object.values(currentUser.producers)) {
      if (!producer) continue;

      if (
        router &&
        !router.canConsume({ producerId: producer.id, rtpCapabilities })
      ) {
        console.warn(`Cannot consume producer with ID ${producer.id}`);
        continue;
      }

      try {
        const recvTransport = user.transports.recvTransport;
        if (!recvTransport) {
          console.log('No receive transport found for user:', user.userId);
          continue;
        }
        const consumer = await recvTransport.consume({
          producerId: producer.id,
          rtpCapabilities,
          paused: false,
        });
        const userSocket = user.socket;
        if (userSocket) {
          userSocket.emit('newConsumer', {
            сonsumerUserId: user.userId,
            producerUserId: clientData.userId,
            id: consumer.id,
            producerId: producer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
          });
        } else {
          console.warn(`Socket for user ${user.userId} not found`);
        }

        consumer.on('transportclose', () => {
          console.log(`Transport closed for consumer ${consumer.id}`);
        });

        consumer.on('producerclose', () => {
          console.log(`Producer closed; closing consumer ${consumer.id}`);
          consumer.close();
        });

        if (!clientData.consumers) {
          clientData.consumers = [];
        }
        clientData.consumers.push(consumer);
        clients.set(socket, clientData);
      } catch (error) {
        console.error(
          `Error creating consumer for producer ${producer.id}:`,
          error,
        );
      }
    }
  }
}
