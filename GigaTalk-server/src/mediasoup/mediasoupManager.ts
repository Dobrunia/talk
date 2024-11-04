import {
  Consumer,
  Producer,
  Router,
  WebRtcTransport,
} from 'mediasoup/node/lib/types';
import WebSocket from 'ws';
import { getNextWorker } from './worker';

const yellow = '\x1b[33m';
const reset = '\x1b[0m';

// Map для хранения информации о каналах и пользователях
const channelUsers = new Map<
  string,
  {
    serverId: string;
    channelId: string;
    router?: Router; // Router для комнаты, созданный через Mediasoup
    users: Array<{
      ws: WebSocket; // WebSocket соединение пользователя
      userId: string;
      username: string;
      userAvatar: string;

      transports?: {
        sendTransport?: WebRtcTransport; // Transport для отправки медиа от клиента к серверу
        recvTransport?: WebRtcTransport; // Transport для приема медиа от сервера к клиенту
      };

      producers?: {
        audioProducer?: Producer; // Producer для аудио потока
        videoProducer?: Producer; // Producer для видео потока с камеры
        screenProducer?: Producer; // Producer для потока экрана
      };

      consumers?: Array<Consumer>; // Массив Consumers для приема медиа от других пользователей
    }>;
  }
>();

export function addUserToChannel(
  ws: WebSocket,
  serverId: string,
  channelId: string,
  userId: string,
  username: string,
  userAvatar: string,
) {
  const channelKey = `${serverId}_${channelId}`;

  // Если канала нет, создаем новую запись и привязываем Router
  if (!channelUsers.has(channelKey)) {
    const { router } = getNextWorker(); // Получаем Router из следующего доступного Worker
    channelUsers.set(channelKey, {
      serverId,
      channelId,
      router,
      users: [],
    });
    console.log(`Router создан для канала ${channelKey}`);
  }

  // Добавляем пользователя в канал
  const channel = channelUsers.get(channelKey);
  channel?.users.push({ ws, userId, username, userAvatar });
}

export function removeUserFromChannel(
  ws: WebSocket,
  serverId: string,
  channelId: string,
) {
  const channelKey = `${serverId}_${channelId}`;
  const channel = channelUsers.get(channelKey);

  // Если канал не найден, ничего не делаем
  if (!channel) {
    console.log(
      `${yellow}WedRTC:${reset} Channel ${channelId} on server ${serverId} does not exist.`,
    );
    return;
  }

  // Находим индекс пользователя по WebSocket соединению
  const userIndex = channel.users.findIndex((user) => user.ws === ws);

  // Если пользователь найден, удаляем его из массива
  if (userIndex !== -1) {
    const removedUser = channel.users.splice(userIndex, 1)[0];
    console.log(
      `${yellow}WedRTC:${reset} User ${removedUser.username} has left channel ${channelId} on server ${serverId}`,
    );
  } else {
    console.log(
      `${yellow}WedRTC:${reset} User not found in channel ${channelId} on server ${serverId}`,
    );
    return;
  }

  // Если после удаления пользователей в канале больше нет, удаляем канал
  if (channel.users.length === 0) {
    channelUsers.delete(channelKey);
    console.log(
      `${yellow}WedRTC:${reset} Channel ${channelId} on server ${serverId} is now empty and removed.`,
    );
  }
}

export function removeUserFromAllChannels(ws: WebSocket) {
  channelUsers.forEach((channel, channelKey) => {
    const userIndex = channel.users.findIndex((user) => user.ws === ws);

    if (userIndex !== -1) {
      const removedUser = channel.users.splice(userIndex, 1)[0];
      console.log(
        `${yellow}WedRTC:${reset} User ${removedUser.username} has left channel ${channel.channelId} on server ${channel.serverId}`,
      );

      // Если после удаления пользователей в канале больше нет, удаляем канал
      if (channel.users.length === 0) {
        channelUsers.delete(channelKey);
        console.log(
          `${yellow}WedRTC:${reset} Channel ${channel.channelId} on server ${channel.serverId} is now empty and removed.`,
        );
      }
    }
  });
}
