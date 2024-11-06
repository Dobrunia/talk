import { Socket } from 'socket.io';
import {
  addUserToChannel,
  clients,
  getUsersInChannels,
  removeUserFromChannel,
} from '../data.ts';
import { socketController } from '../controllers/SocketController.ts';

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
        joinChannel(socket, data.channelId);
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

async function joinChannel(socket: Socket, channelId: string) {
  channelId = String(channelId);
  const clientData = clients.get(socket);
  if (!clientData) return;
  //TODO:: проверка, что есть доступ к каналу
  addUserToChannel(socket, channelId, clientData);
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

async function leaveChannel(socket: Socket) {
  const clientData = clients.get(socket);
  if (!clientData) return;
  if (!clientData.currentChannelId) return;
  
  console.log('clientData', clientData);
  const roomId = await socketController.getServerIdByChannelId(clientData.currentChannelId);
  removeUserFromChannel(socket);
  console.log('roomId', roomId, 'clientData', clientData)
  if (!roomId) return;
  // Отправляем всем в комнате, включая отправителя, информацию о пользователе
  const data = {
    type: 'user_leave_channel',
    userId: clientData.userId,
  };
  socket.to(roomId).emit('message', data); // Отправляем другим пользователям
  socket.emit('message', data); // Отправляем самому отправителю
}
