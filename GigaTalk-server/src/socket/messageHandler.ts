import { Socket } from 'socket.io';
import {
  addUserToChannel,
  clients,
  getUserCurrentChannelId,
  getUsersInChannels,
  removeUserFromChannel,
  usersByChannels,
} from '../data.ts';
import { socketController } from '../controllers/SocketController.ts';
import { roomRouters } from '../mediasoup/mediasoupManager.ts';

const cyan = '\x1b[36m';
const reset = '\x1b[0m';

export function handleMessage(socket: Socket, message: any) {
  try {
    // Парсинг данных, если сообщение пришло в виде строки JSON
    const data = typeof message === 'string' ? JSON.parse(message) : message;
    console.log(`${cyan}Socket:${reset} Server get message type: ${data.type}`);
    switch (data.type) {
      case 'user_opened_server':
        userOpenedServer(socket, data.serverId);
        break;
      case 'join_server':
        break;
      case 'leave_server':
        break;
      case 'join_channel':
        //joinChannel(socket, data.channelId);
        break;
      case 'leave_channel':
        leaveChannel(socket);
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  } catch (error) {
    console.error('${cyan}Socket:${reset} Failed to handle message:', error);
  }
}

async function userOpenedServer(socket: Socket, serverId: string) {
  //права, если есть или у него режим бога тогда скип, получаю список всех каналов и пользователей в каждом
  const clientData = clients.get(socket);
  if (!clientData) return;
  console.log('Проверка, что есть permission ', clientData.permission);
  //   if (clientData.permition == 2) {
  //     //права бога
  //   }
  const channelsIds = await socketController.getChannelsForUserInServer(
    clientData.userId,
    serverId,
  );
  if (!channelsIds) return;
  const channelsWithUsers = getUsersInChannels(channelsIds);
  const data = {
    type: 'server_users_in_channels',
    channelsWithUsers,
  };
  socket.emit('message', data);
}

export async function joinChannel(socket: Socket, channelId: string) {
  const clientData = clients.get(socket);
  if (!clientData) return;
  //TODO:: проверка, что есть доступ к каналу
  clientData.socket = socket;
  addUserToChannel(channelId, clientData);
  const roomId = await socketController.getServerIdByChannelId(channelId);
  if (!roomId) return;
  // Отправляем всем в комнате, включая отправителя, информацию о пользователе
  const userInfo = {
    serverId: roomId,
    channelId: channelId,
    userId: clientData.userId,
    username: clientData.username,
    userAvatar: clientData.userAvatar,
  };
  const data = {
    type: 'user_joined_channel',
    userInfo,
  };
  socket.to(roomId).emit('message', data); // Отправляем другим пользователям
  socket.emit('message', data); // Отправляем самому отправителю
}

export async function leaveChannel(socket: Socket) {
  const clientData = clients.get(socket);
  if (!clientData) return;

  const chId = getUserCurrentChannelId(clientData);
  if (!chId) return;

  console.log('clientData', clientData);

  const roomId = await socketController.getServerIdByChannelId(chId);
  if (!roomId) return;

  // Удаляем пользователя из канала
  removeUserFromChannel(socket);

  // Отправляем всем в комнате информацию о том, что пользователь покинул канал
  const data = {
    type: 'user_leave_channel',
    userId: clientData.userId,
  };
  socket.to(roomId).emit('message', data); // Отправляем другим пользователям
  socket.emit('message', data); // Отправляем самому отправителю

  console.log('roomId', roomId, 'clientData', clientData);

  // Освобождаем ресурсы пользователя
  if (clientData.transports) {
    for (const transport of Object.values(clientData.transports)) {
      if (transport) {
        console.log(`Closing transport ${transport.id} for user ${clientData.userId}`);
        transport.close();
      }
    }
  }

  if (clientData.producers) {
    for (const producer of Object.values(clientData.producers)) {
      if (producer) {
        console.log(`Closing producer ${producer.id} for user ${clientData.userId}`);
        producer.close();
      }
    }
  }

  if (clientData.consumers) {
    for (const consumer of clientData.consumers) {
      if (consumer) {
        console.log(`Closing consumer ${consumer.id} for user ${clientData.userId}`);
        consumer.close();
      }
    }
  }

  // // Удаляем данные пользователя из списка клиентов
  // clients.delete(socket);

  // Проверяем, остались ли пользователи в комнате
  const usersInChannel = usersByChannels.get(chId);
  if (!usersInChannel || usersInChannel.length === 0) {
    // Если в комнате больше нет пользователей, удаляем Router
    const router = roomRouters.get(chId);
    if (router) {
      console.log(`Closing router for room ${chId}`);
      router.close();
      roomRouters.delete(chId);
    }
    // Удаляем канал из usersByChannels
    usersByChannels.delete(chId);
  } else {
    // Обновляем список пользователей в канале
    const updatedUsers = usersInChannel.filter(
      (user) => user.userId !== clientData.userId
    );
    usersByChannels.set(chId, updatedUsers);
  }

  console.log(`User ${clientData.userId} successfully left channel ${chId}`);
}

