import { serverDATA } from '../types/types.ts';
import { removeUserFromChannel, renderUserToChannel } from '../ui-kit/index.ts';
import { updateCache } from '../utils/cache.ts';
import { sendSocketMessage } from './socket.ts';

export function handleSocketMessage(data: any) {
  switch (data.type) {
    case 'user_join_server':
      console.log('Пользователь подключился к серверу', data);
      break;
    case 'user_leave_server':
      console.log('Пользователь покинул сервер', data);
      break;
    case 'user_join_channel':
      renderUserToChannel(
        data.serverId,
        data.channelId,
        data.user.userId,
        data.user.username,
        data.user.userAvatar,
      );
      console.log('Пользователь подключился к каналу', data);
      break;
    case 'user_leave_channel':
      removeUserFromChannel(data.serverId, data.channelId, data.user.userId);
      console.log('Пользователь покинул канал', data);
      break;
    default:
      console.warn('Неизвестный тип сообщения:', data.type);
  }
}

export async function joinToAllMyServers() {
  await updateCache.serversList();
  const cachedServers = localStorage.getItem('serversList');
  if (!cachedServers) {
    return;
  }
  JSON.parse(cachedServers).forEach((element: serverDATA) => {
    joinServer(element.id);
  });
  console.log('Подключился ко всем моим серверам');
}

export async function leaveFromAllMyServers() {
  await updateCache.serversList();
  const cachedServers = localStorage.getItem('serversList');
  if (!cachedServers) {
    return;
  }
  sendSocketMessage({ type: 'leave_server' });
  console.log('Отключился от всех моих серверов');
}

function joinServer(serverId: string) {
  sendSocketMessage({
    type: 'join_server',
    serverId,
  });
}

export function joinChannel(serverId: string, channelId: string) {
  sendSocketMessage({
    type: 'join_channel',
    serverId,
    channelId,
  });
}

export function leaveChannel(serverId: string, channelId: string) {
  sendSocketMessage({
    type: 'leave_channel',
    serverId,
    channelId,
  });
}
