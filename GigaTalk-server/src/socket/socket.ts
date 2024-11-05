import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  Consumer,
  DtlsParameters,
  MediaKind,
  Producer,
  RtpCapabilities,
  RtpParameters,
  WebRtcTransport,
} from 'mediasoup/node/lib/types';
import {
  createWebRtcTransportForClient,
  getRouter,
} from '../mediasoup/mediasoupManager';

dotenv.config();

type ClientData = {
  userId: string;
  username: string;
  userAvatar: string | null;
  serverId: string | null;
  channelId: string | null;
  transports: {
    sendTransport: WebRtcTransport | null;
    recvTransport: WebRtcTransport | null;
  };
  producers: {
    audioProducer: Producer | null;
    videoProducer: Producer | null;
    screenProducer: Producer | null;
  };
  consumers?: Array<Consumer>;
};

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const servers: Record<string, Set<WebSocket>> = {}; // Servers as rooms
export const clients = new Map<WebSocket, ClientData>();
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

export function setupWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req) => {
    const token = new URLSearchParams(req.url?.split('?')[1]).get('token');

    if (!token) {
      ws.close(1008, 'Token is required');
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        username: string;
        userAvatar: string;
      };
      const { id, username, userAvatar } = decoded;

      clients.set(ws, {
        userId: id,
        username,
        userAvatar,
        serverId: null,
        channelId: null,
        transports: {
          sendTransport: null,
          recvTransport: null,
        },
        producers: {
          audioProducer: null,
          videoProducer: null,
          screenProducer: null,
        },
      });

      console.log(`WebSocket connection established with userId: ${id}`);

      ws.on('message', (message: string) => {
        handleSocketMessage(ws, message);
      });
      ws.on('close', () => {
        handleClientDisconnect(ws);
      });
    } catch (error) {
      console.error('Invalid token:', error);
      ws.close(1008, 'Invalid token');
    }
  });
}

// Handle client disconnection
function handleClientDisconnect(ws: WebSocket) {
  const clientData = clients.get(ws);
  if (clientData) {
    removeUserFromChannel(ws, clientData.serverId, clientData.channelId);
    leaveServer(ws);
    clients.delete(ws);
    console.log(`User ${clientData.username} disconnected`);
  }
}

// Handle WebSocket messages
async function handleSocketMessage(ws: WebSocket, message: string) {
  try {
    const data = JSON.parse(message);
    console.log('Handling socket message of type:', data.type);
    switch (data.type) {
      case 'join_server':
        joinServer(ws, data.serverId);
        break;
      case 'leave_server':
        leaveServer(ws);
        break;
      case 'join_channel':
        await joinChannel(ws, data.serverId, data.channelId);
        console.log(`${yellow}handleJoinChannel done!${reset}`);
        break;
      case 'leave_channel':
        leaveChannel(ws, data.serverId, data.channelId);
        break;
      case 'update_server_users_in_channels':
        broadcastUsersInChannels(ws, data.serverId);
        break;
      case 'getRouterRtpCapabilities':
        returnRouterRtpCapabilities(ws);
        break;
      case 'connectTransport':
        //console.log(data.data.transportId, data.data.dtlsParameters)
        connectTransport(ws, data.data.transportId, data.data.dtlsParameters);
        break;
      case 'produce':
        await produceHandler(
          ws,
          data.data.transportId,
          data.data.kind,
          data.data.rtpParameters,
        );
        break;
      case 'consume':
        await consumeHandler(
          ws,
          data.data.producerId,
          data.data.rtpCapabilities,
        );
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  } catch (error) {
    console.error('Failed to handle message:', error);
  }
}

function findProducerById(producerId: string) {
  for (const client of clients.values()) {
    if (client.producers) {
      for (const producer of Object.values(client.producers)) {
        if (producer && producer.id === producerId) {
          return producer;
        }
      }
    }
  }
  return null;
}

async function consumeHandler(
  ws: WebSocket,
  producerId: string,
  rtpCapabilities: RtpCapabilities,
) {
  const clientData = clients.get(ws);

  if (!clientData || !clientData.transports.recvTransport) {
    ws.send(
      JSON.stringify({
        type: 'consume',
        error: 'Receive transport not found',
      }),
    );
    return;
  }

  const producer = findProducerById(producerId);

  if (!producer) {
    ws.send(
      JSON.stringify({
        type: 'consume',
        error: 'Producer not found',
      }),
    );
    return;
  }

  try {
    // Создаем Consumer
    const consumer = await clientData.transports.recvTransport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: false, // Установка paused в false для немедленного начала воспроизведения
    });

    // Отправляем параметры Consumer клиенту
    console.log('Отправляем параметры Consumer клиенту');
    ws.send(
      JSON.stringify({
        type: 'consume',
        data: {
          producerId: producer.id,
          consumerId: consumer.id,
          kind: consumer.kind, // Передаем kind
          rtpParameters: consumer.rtpParameters,
        },
      }),
    );

    // Сохраняем consumer в clientData для дальнейшего управления
    if (!clientData.consumers) {
      clientData.consumers = [];
    }
    clientData.consumers.push(consumer);

    // Устанавливаем обработчики событий на consumer
    consumer.on('transportclose', () => {
      console.log(`Consumer ${consumer.id} closed due to transport close`);
      consumer.close();
    });

    consumer.on('producerclose', () => {
      if (!producer) return;
      console.log(`Consumer ${consumer.id} closed due to producer close`);
      ws.send(
        JSON.stringify({
          type: 'producerClosed',
          data: { producerId: producer.id },
        }),
      );
      consumer.close();
    });
  } catch (error) {
    ws.send(
      JSON.stringify({
        type: 'consume',
        error: (error as any).message,
      }),
    );
  }
}

async function produceHandler(
  ws: WebSocket,
  transportId: string,
  kind: MediaKind,
  rtpParameters: RtpParameters,
) {
  // Находим sendTransport по transportId
  const transport = findTransportById(transportId);
  console.log('produceHandler');
  if (!transport) {
    console.log('if');
    ws.send(
      JSON.stringify({
        type: 'produce',
        transportId,
        error: 'Transport not found',
      }),
    );
    return;
  }

  try {
    // Создаем Producer для данного потока (аудио, видео и т.д.)
    const producer = await transport.produce({ kind, rtpParameters });
    // Получаем данные клиента
    const clientData = clients.get(ws);
    if (!clientData) {
      console.error('Client not found');
      return;
    }

    // Сохраняем продюсера в зависимости от типа потока
    switch (kind) {
      case 'audio':
        clientData.producers.audioProducer = producer;
        break;
      case 'video':
        clientData.producers.videoProducer = producer;
        break;
      // case 'screen':
      //   clientData.producers.screenProducer = producer;
      //   break;
    }
    clients.set(ws, clientData);
    console.log(
      `Producer of kind ${kind} created for user ${clientData.userId}`,
    );
    console.log('sdsdsdsdsdsdsd');
    // Отправляем клиенту producerId для подтверждения
    ws.send(
      JSON.stringify({
        type: 'produce',
        transportId,
        id: producer.id, // Возвращаем producerId клиенту
      }),
    );

    // Дополнительно: можем сохранить producer в данных клиента для управления позже
    // const clientData = clients.get(ws);
    // if (clientData) {
    //   if (!clientData.producers) {
    //     clientData.producers = {
    //       audioProducer: null,
    //       videoProducer: null,
    //       screenProducer: null,
    //     };
    //   }

    // Приведение типа для указания конкретного ключа
    clientData.producers[
      `${kind}Producer` as keyof typeof clientData.producers
    ] = producer;
    // Уведомляем всех участников канала о новом Producer
    const channelId = clientData.channelId; // Предполагается, что channelId хранится в данных клиента
    if (channelId) {
      broadcastNewProducer(channelId, producer.id);
    }

    producer.on('@close', () => {
      ws.send(
        JSON.stringify({
          type: 'producerClosed',
          data: { producerId: producer.id },
        }),
      );
    });
  } catch (error) {
    console.log(error);
    // Отправляем сообщение об ошибке, если создать Producer не удалось
    ws.send(
      JSON.stringify({
        type: 'produce',
        transportId,
        error: (error as any).message,
      }),
    );
  }
}

function getClientsInChannel(channelId: string): WebSocket[] {
  const clientsInChannel: WebSocket[] = [];

  for (const [ws, clientData] of clients.entries()) {
    // Проверяем, что clientData.channelId совпадает с заданным channelId
    if (clientData.channelId === channelId) {
      clientsInChannel.push(ws);
    }
  }

  return clientsInChannel;
}

function broadcastNewProducer(channelId: string, producerId: string) {
  // Рассылаем всем участникам канала уведомление о новом Producer
  for (const client of getClientsInChannel(channelId)) {
    client.send(
      JSON.stringify({
        type: 'newProducer',
        data: {
          producerId,
        },
      }),
    );
  }
}

export function findTransportById(transportId: string): WebRtcTransport | null {
  for (const clientData of clients.values()) {
    if (clientData.transports.sendTransport?.id === transportId) {
      return clientData.transports.sendTransport;
    }
    if (clientData.transports.recvTransport?.id === transportId) {
      return clientData.transports.recvTransport;
    }
  }
  return null; // Если транспорт не найден
}

function connectTransport(
  ws: WebSocket,
  transportId: string,
  dtlsParameters: DtlsParameters,
) {
  // Найдем транспорт по transportId (может быть как sendTransport, так и recvTransport)
  const transport = findTransportById(transportId);
  // let transport;
  // const client = clients.get(ws)
  // if (data.recvTransport && client) {
  //   // Если это recvTransport, сохраняем его в clientData
  //   client.transports.recvTransport = data.recvTransport;
  //   transport = client.transports.recvTransport;
  // } else if (data.sendTransport && client) {
  //   // Если это sendTransport, сохраняем его в clientData
  //   client.transports.sendTransport = data.sendTransport;
  //   transport = client.transports.sendTransport
  // }

  // const transport: WebRtcTransport = await router.createWebRtcTransport(
  //   transportOptions,
  // );
  // const client = clients.get(ws);
  // const transport = client?.transport;
  //console.log('transport ', transport);
  if (!transport) {
    ws.send(
      JSON.stringify({
        type: 'connectTransport',
        transportId,
        error: 'Transport not found',
      }),
    );
    return;
  }

  // Подключаем транспорт
  transport
    .connect({ dtlsParameters })
    .then(() => {
      // Отправляем клиенту подтверждение успешного подключения
      ws.send(
        JSON.stringify({
          type: 'connectTransport',
          transportId,
          success: true,
        }),
      );
    })
    .catch((error: any) => {
      // Отправляем клиенту сообщение об ошибке
      ws.send(
        JSON.stringify({
          type: 'connectTransport',
          transportId,
          error: error.message,
        }),
      );
    });
}

function returnRouterRtpCapabilities(ws: WebSocket) {
  const clientData = clients.get(ws);
  if (clientData && clientData.channelId && clientData.transports) {
    let router = getRouter(clientData.channelId);
    if (!router) {
      console.error('Роутер не инициализирован');
      return;
    }
    let sendTransportParams, recvTransportParams;
    if (clientData.transports.sendTransport) {
      sendTransportParams = {
        id: clientData.transports.sendTransport.id,
        iceParameters: clientData.transports.sendTransport.iceParameters,
        iceCandidates: clientData.transports.sendTransport.iceCandidates,
        dtlsParameters: clientData.transports.sendTransport.dtlsParameters,
      };
    }
    if (clientData.transports.recvTransport) {
      recvTransportParams = {
        id: clientData.transports.recvTransport.id,
        iceParameters: clientData.transports.recvTransport.iceParameters,
        iceCandidates: clientData.transports.recvTransport.iceCandidates,
        dtlsParameters: clientData.transports.recvTransport.dtlsParameters,
      };
    }


    // ответ с RTP-способностями роутера
    const rtpCapabilities = JSON.stringify({
      type: 'returnRtpCapabilities',
      data: {
        rtpCapabilities: router.rtpCapabilities,
        sendTransportParams,
        recvTransportParams,
      },
    });
    //console.log(router.rtpCapabilities)
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(rtpCapabilities);
    }
  }
}

async function joinChannel(ws: WebSocket, serverId: string, channelId: string) {
  const clientData = clients.get(ws);
  if (!clientData) {
    console.error('Client not found');
    return;
  }
  clientData.serverId = serverId;
  clientData.channelId = channelId;
  // clients.set(ws, clientData);
  const sendTransport = await createWebRtcTransportForClient(channelId);
  const recvTransport = await createWebRtcTransportForClient(channelId);
  //console.log('sendTransportParams ', sendTransportParams);

  clientData.transports.sendTransport = sendTransport;
  clientData.transports.recvTransport = recvTransport;
  clients.set(ws, clientData);
  const sendTransportParams = {
    id: sendTransport.id,
    iceParameters: sendTransport.iceParameters,
    iceCandidates: sendTransport.iceCandidates,
    dtlsParameters: sendTransport.dtlsParameters,
  };
  const recvTransportParams = {
    id: recvTransport.id,
    iceParameters: recvTransport.iceParameters,
    iceCandidates: recvTransport.iceCandidates,
    dtlsParameters: recvTransport.dtlsParameters,
  };

  broadcastInfoToUser(ws, { sendTransportParams, recvTransportParams });
  broadcastUserJoinChannel(ws, serverId, channelId);
}

function leaveChannel(ws: WebSocket, serverId: string, channelId: string) {
  const clientData = clients.get(ws);
  if (!clientData) {
    console.error('Client not found');
    return;
  }
  clientData.channelId = null;
  clients.set(ws, clientData);
  broadcastUserLeaveChannel(ws, serverId, channelId);
}

function removeUserFromChannel(
  ws: WebSocket,
  serverId: string | null,
  channelId: string | null,
) {
  if (!serverId || !channelId) return;
  const channelUsers = Array.from(clients.values()).filter(
    (client) => client.serverId === serverId && client.channelId === channelId,
  );

  if (channelUsers.length === 0) {
    console.log(
      `Channel ${channelId} on server ${serverId} is now empty and removed.`,
    );
  }
}

function joinServer(ws: WebSocket, serverId: string) {
  const clientData = clients.get(ws);
  if (clientData) {
    clientData.serverId = serverId;
    clients.set(ws, clientData);

    if (!servers[serverId]) {
      servers[serverId] = new Set();
    }
    servers[serverId].add(ws);

    console.log(`User ${clientData.username} joined server ${serverId}`);
    broadcastUserJoinServer(serverId);
  }
}

function leaveServer(ws: WebSocket) {
  const clientData = clients.get(ws);
  if (clientData && clientData.serverId) {
    const { serverId } = clientData;
    clientData.serverId = null;
    clientData.channelId = null;
    clients.set(ws, clientData);

    if (servers[serverId]) {
      servers[serverId].delete(ws);
      if (servers[serverId].size === 0) {
        delete servers[serverId];
      }
    }

    console.log(`User ${clientData.username} left server ${serverId}`);
    broadcastUserLeaveServer(serverId);
  }
}

function broadcastUserJoinServer(serverId: string) {
  const usersInServer = Array.from(servers[serverId] || []).map((ws) =>
    clients.get(ws),
  );
  const userListMessage = JSON.stringify({
    type: 'user_join_server',
    serverId,
    users: usersInServer.map((user) => ({
      userId: user?.userId,
      username: user?.username,
      userAvatar: user?.userAvatar,
    })),
  });

  servers[serverId]?.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(userListMessage);
    }
  });
}

function broadcastUserLeaveServer(serverId: string) {
  const usersInServer = Array.from(servers[serverId] || []).map((ws) =>
    clients.get(ws),
  );
  const userListMessage = JSON.stringify({
    type: 'user_leave_server',
    serverId,
    users: usersInServer.map((user) => ({
      userId: user?.userId,
      username: user?.username,
      userAvatar: user?.userAvatar,
    })),
  });

  servers[serverId]?.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(userListMessage);
    }
  });
}

function broadcastUserJoinChannel(
  ws: WebSocket,
  serverId: string,
  channelId: string,
) {
  const clientData = clients.get(ws);
  if (!clientData) return;

  const userJoinMessage = JSON.stringify({
    type: 'user_join_channel',
    serverId,
    channelId,
    user: {
      userId: clientData.userId,
      username: clientData.username,
      userAvatar: clientData.userAvatar,
    },
  });

  servers[serverId]?.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(userJoinMessage);
    }
  });
  console.log(`User ${clientData.username} JoinChannel ${channelId}`);
}

function broadcastUserLeaveChannel(
  ws: WebSocket,
  serverId: string,
  channelId: string,
) {
  const clientData = clients.get(ws);
  if (!clientData) return;

  const userLeaveMessage = JSON.stringify({
    type: 'user_leave_channel',
    serverId,
    channelId,
    user: {
      userId: clientData.userId,
      username: clientData.username,
      userAvatar: clientData.userAvatar,
    },
  });

  servers[serverId]?.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(userLeaveMessage);
    }
  });
  console.log(`User ${clientData.username} LeaveChannel ${channelId}`);
}

function broadcastUsersInChannels(ws: WebSocket, serverId: string) {
  const usersInChannels = Array.from(clients.values())
    .filter((client) => client.serverId === serverId)
    .map((client) => ({
      userId: client.userId,
      username: client.username,
      userAvatar: client.userAvatar,
      channelId: client.channelId,
    }));

  const returnUsersInChannels = JSON.stringify({
    type: 'return_server_users_in_channels',
    serverId,
    users: usersInChannels,
  });

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(returnUsersInChannels);
  }
}

function broadcastInfoToUser(ws: WebSocket, message: any) {
  const infoMessage = JSON.stringify({
    type: 'transportsCreated',
    data: {
      sendTransportParams: message.sendTransportParams,
      recvTransportParams: message.recvTransportParams,
    },
  });

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(infoMessage);
  }
}
