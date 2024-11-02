import { serverDATA } from '../types/types.ts';
import { removeUserFromChannel, renderUserToChannel } from '../ui-kit/index.ts';
import { updateCache } from '../utils/cache.ts';
import { sendSocketMessage } from './socket.ts';

export function handleSocketMessage(data: any) {
  switch (data.type) {
    case 'user_join_server':
      // renderUserToServer(
      //   data.serverId,
      //   data.userId,
      //   data.username,
      //   data.userAvatar,
      // );
      console.log('Пользователь подключился к серверу', data);
      break;
    case 'user_leave_server':
      //removeUserFromServer(data.serverId, data.userId);
      console.log('Пользователь покинул сервер', data);
      break;
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
      console.log('Пользователь покинул канал', data);
      break;
    case 'user_list_server':
      //updateServerUserList(data.serverId, data.users);
      console.log('Обновлен список пользователей на сервере', data);
      break;
    case 'user_list_channel':
      //updateChannelUserList(data.channelId, data.users);
      console.log('Обновлен список пользователей в канале', data);
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
