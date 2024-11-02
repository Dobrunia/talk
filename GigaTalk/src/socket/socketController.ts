import { serverDATA } from '../types/types.ts';
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