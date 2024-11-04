import { handleNewProducer, handleTransportOptions } from '../mediasoupClient/mediasoupClientSetup.ts';
import { serverDATA } from '../types/types.ts';
import {
  removeUserFromChannel,
  renderServerUsersInChannels,
  renderUserToChannel,
} from '../ui-kit/index.ts';
import { updateCache } from '../utils/cache.ts';
import { sendSocketMessage } from './socket.ts';

export function handleSocketMessage(data: any, socket: WebSocket) {
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
    case 'return_server_users_in_channels':
      renderServerUsersInChannels(data);
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
    sendSocketMessage({
      type: 'join_server',
      serverId: element.id,
    });
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
