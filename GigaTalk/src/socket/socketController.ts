import {
  checkDevice,
  consumeHandler,
  createTransports,
  newProducerHandler,
  producerClosedHandler,
  setDevice,
} from '../mediasoupClient/mediasoupClientSetup.ts';
import { serverDATA } from '../types/types.ts';
import {
  removeUserFromChannel,
  renderServerUsersInChannels,
  renderUserToChannel,
} from '../ui-kit/index.ts';
import { updateCache } from '../utils/cache.ts';
import { sendSocketMessage } from './socket.ts';

export async function handleSocketMessage(socket: WebSocket, data: any) {
  console.log('Handling socket message of type:', data.type);
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
    case 'transportsCreated':
      // Загружаем устройство если его нет
      //console.log(data.data.sendTransportParams, data.data.recvTransportParams);
      await checkDevice(
        socket,
        data.data.sendTransportParams,
        data.data.recvTransportParams,
      );
      break;
    case 'returnRtpCapabilities':
      console.log('returnRtpCapabilities ', data.data);
      await setDevice(data.data.rtpCapabilities);

      await createTransports(
        socket,
        data.data.sendTransportParams,
        data.data.recvTransportParams,
      );
      break;
    case 'newProducer':
      newProducerHandler(socket, data.data.producerId);
      break;
    case 'consume':
      console.log(data.data)
      if (data.data) {
        await consumeHandler(
          data.data.consumerId,
          data.data.producerId,
          data.data.kind,
          data.data.rtpParameters,
        );
      }

      break;
    case 'producerClosed':
      producerClosedHandler(data.data.producerId);
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
