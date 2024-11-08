import {
  Router,
  MediaKind,
  DtlsParameters,
  RtpParameters,
  RtpCapabilities,
} from 'mediasoup/node/lib/types';
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
    switch (type) {
      case 'joinRoom':
        await joinMediasoupRoom(socket, payload.roomId, callback);
        break;
      case 'createTransport':
        await createWebRtcTransport(socket, callback);
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
      default:
        console.warn(`Unknown mediasoup action type: ${type}`);
        callback({ error: 'Unknown action type' });
    }
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
      listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }], // Replace with your external IP if necessary
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    clientData.transports.sendTransport = transport;
    console.log('Send transport created:', transport.id);
    clientData.transports.recvTransport = transport;
    console.log('Recv transport created:', transport.id);

    clients.set(socket, clientData);

    // Return transport parameters to the client
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
  dtlsParameters: DtlsParameters,
  callback: (response: any) => void,
) {
  const clientData = clients.get(socket);
  if (!clientData) {
    throw new Error('Client not found');
  }
  const transport = clientData.transports.sendTransport;
  if (!transport || transport.id !== transportId) {
    throw new Error('Transport not found');
  }

  try {
    await transport.connect({ dtlsParameters });
    console.log(`Transport for ${clientData.username} connected successfully`);
    callback({ connected: true });
  } catch (error) {
    console.error(`Failed to connect transport ${transportId}:`, error);
    throw error;
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

  const transport = clientData.transports.sendTransport; // функция для получения транспорта по ID
  if (!transport) {
    throw new Error('Транспорт не найден');
  }

  // Создаем продюсера на основе переданных данных
  const producer = await transport.produce({
    kind: kind,
    rtpParameters,
  });

  console.log('producer', kind)
  if (producer.kind === 'audio') {
    clientData.producers.audioProducer = producer;
  } else if (producer.kind === 'video') {
    clientData.producers.videoProducer = producer;
  }

  clients.set(socket, clientData);
  callback({ id: producer.id });
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

  const room = getUserCurrentChannelId(clientData);
  if (!room) {
    console.error('Комната не найдена');
    return;
  }

  const recvTransport = clientData.transports.recvTransport;
  if (!recvTransport) {
    console.error('RecvTransport не найден для клиента');
    return;
  }

  const usersInChannel = usersByChannels.get(room);
  if (!usersInChannel) {
    console.error('Пользователи в комнате не найдены');
    return;
  }

  const router = roomRouters.get(room);
  if (!router) {
    console.error('Room not found');
    return;
  }

  for (const user of usersInChannel) {
    //console.log('clientData', clientData)
    if (user.userId === clientData.userId) {
      console.log('Самого себя слышать нет смысла');
      return;
    }
    for (const producer of [
      user.producers.audioProducer,
      user.producers.videoProducer,
      user.producers.screenProducer,
    ]) {
      if (!producer) {
        console.warn(`Продюсер от  ${user.username} не найден`);
        continue;
      }
      if (!router.canConsume({ producerId: producer.id, rtpCapabilities })) {
        console.warn(`Невозможно потреблять продюсер с ID ${producer.id}`);
        continue;
      }

      try {
        const consumer = await recvTransport.consume({
          producerId: producer.id,
          rtpCapabilities,
          paused: false, // Принимаем поток сразу
        });

        // Отправляем клиенту информацию о созданном consumer
        socket.emit('newConsumer', {
          id: consumer.id,
          producerId: producer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });

        // Добавляем обработчики событий для consumer
        consumer.on('transportclose', () => {
          console.log(`Транспорт закрыт для consumer с ID ${consumer.id}`);
        });

        consumer.on('producerclose', () => {
          console.log(`Продюсер с ID ${producer.id} закрыт, consumer завершен`);
          consumer.close();
        });

        // Сохраняем consumer в данных клиента
        if (!clientData.consumers) {
          clientData.consumers = [];
        }
        clientData.consumers.push(consumer);
        clients.set(socket, clientData);
      } catch (error) {
        console.error(
          `Ошибка при создании consumer для продюсера с ID ${producer.id}:`,
          error,
        );
      }
    }
  }
}
