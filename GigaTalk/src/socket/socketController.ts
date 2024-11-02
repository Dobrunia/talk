import { serverDATA } from '../types/types.ts';
import { removeUserFromChannel, renderUserToChannel } from '../ui-kit/index.ts';
import { updateCache } from '../utils/cache.ts';
import { sendSocketMessage } from './socket.ts';

export function handleSocketMessage(data: any) {
  switch (data.type) {
    case 'user_join_channel':
      renderUserToChannel(
        data.serverId,
        data.channelId,
        data.userId,
        data.username,
        data.userAvatar,
      );
      console.log('Пользователь подключился к каналу', data);
      break;
    case 'user_leave_channel':
      removeUserFromChannel(data.serverId, data.channelId, data.userId);
      console.log('пользователь покинул канал', data);
      break;
    default:
      console.warn('Неизвестный тип сообщения:', data.type);
  }
}

export async function joinToAllMyServers() {
  await updateCache.serversList();
  const cachedServers = localStorage.getItem('serversList');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const userAvatar = 'img';
  if (!cachedServers || !userId || !username || !userAvatar) {
    return;
  }
  JSON.parse(cachedServers).forEach((element: serverDATA) => {
    joinServer(element.id, userId, username, userAvatar);
  });
  console.log('Подклился ко всем моим серверам');
}

export async function leaveFromAllMyServers() {
  await updateCache.serversList();
  const cachedServers = localStorage.getItem('serversList');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const userAvatar = 'img';
  if (!cachedServers || !userId || !username || !userAvatar) {
    return;
  }
  JSON.parse(cachedServers).forEach((element: serverDATA) => {
    leaveServer(element.id, userId, username, userAvatar);
  });
  console.log('Отключился от всех моих серверов');
}

export function joinServer(
  serverId: string,
  userId: string,
  username: string,
  userAvatar: string,
) {
  sendSocketMessage({
    type: 'join_server',
    serverId,
    userId,
    username,
    userAvatar,
  });
}

export function leaveServer(
  serverId: string,
  userId: string,
  username: string,
  userAvatar: string,
) {
  sendSocketMessage({
    type: 'leave_server',
    serverId,
    userId,
    username,
    userAvatar,
  });
}

export function joinChannel(
  serverId: string,
  channelId: string,
  userId: string,
  username: string,
  userAvatar: string,
) {
  sendSocketMessage({
    type: 'join_channel',
    serverId,
    channelId,
    userId,
    username,
    userAvatar,
  });
}

export function leaveChannel(
  serverId: string,
  channelId: string,
  userId: string,
  username: string,
  userAvatar: string,
) {
  sendSocketMessage({
    type: 'leave_channel',
    serverId,
    channelId,
    userId,
    username,
    userAvatar,
  });
}
