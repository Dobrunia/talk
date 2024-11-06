import { Socket } from 'socket.io';
import { ClientData, UserInfo } from './types/types.ts';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
export const clients = new Map<Socket, ClientData>(); // Хранилище для данных клиентов
export const usersByChannels = new Map<string, ClientData[]>(); // Структура для хранения пользователей по уникальным каналам

export function getUsersInChannels(channelIds: (string | number)[]): {
  [key: string]: UserInfo[];
} {
  const result: { [key: string]: UserInfo[] } = {};

  for (const channelKey of channelIds) {
    const channelId = String(channelKey); // Приводим channelId к строке
    const usersInChannel = usersByChannels.get(channelId); // Получаем массив пользователей

    if (usersInChannel && usersInChannel.length > 0) {
      console.log(`Обрабатываем канал: ${channelId}`);

      // Преобразуем массив `ClientData` в массив `UserInfo`
      const users = usersInChannel.map((clientData) => ({
        userId: clientData.userId,
        username: clientData.username,
        userAvatar: clientData.userAvatar,
      }));

      console.log(`Пользователи в канале ${channelId}:`, users);

      // Добавляем массив пользователей в `result`, используя `channelId` как ключ
      result[channelId] = users;
    } else {
      console.log(`Канал с id ${channelId} не содержит пользователей.`);
    }
  }

  console.log(`Результат функции getUsersInChannels:`, result);
  return result;
}

export function addUserToChannel(
  socket: Socket,
  channelId: string | number,
  clientData: ClientData,
): void {
  // Проверяем, существует ли уже массив для данного канала
  channelId = String(channelId);
  if (!usersByChannels.has(channelId)) {
    // Если канал не существует, создаем новый массив для пользователей
    usersByChannels.set(channelId, []);
    console.log(
      `Если канал не существует, создаем новый массив для пользователей ${usersByChannels}`,
    );
  }

  // Получаем массив пользователей для данного канала
  const usersInChannel = usersByChannels.get(channelId)!;

  // Добавляем пользователя в массив, если его еще нет
  if (!usersInChannel.some((user) => user.userId === clientData.userId)) {
    usersInChannel.push(clientData);
    clientData.currentChannelId = channelId;
    clients.set(socket, clientData);
    console.log(
      `Добавляем пользователя в массив, если его еще нет ${usersByChannels}`,
    );
  }
}

export function removeUserFromChannel(socket: Socket): void {
  // Получаем данные клиента
  const clientData = clients.get(socket);
  if (!clientData) return;

  const channelId = clientData.currentChannelId;
  if (!channelId) return; // Если текущий канал не установлен, выходим

  const usersInChannel = usersByChannels.get(channelId);
  if (!usersInChannel) return; // Если канал не существует, выходим

  // Находим индекс пользователя в массиве
  const userIndex = usersInChannel.findIndex(
    (user) => user.userId === clientData.userId,
  );

  // Если пользователь найден, удаляем его из массива
  if (userIndex !== -1) {
    usersInChannel.splice(userIndex, 1);
    console.log(
      `Пользователь ${clientData.username} удалён из канала ${channelId}`,
    );
  }

  // Если после удаления массив пуст, удаляем канал из `usersByChannels`
  if (usersInChannel.length === 0) {
    usersByChannels.delete(channelId);
    console.log(
      `Канал ${channelId} удалён из usersByChannels, так как он пуст.`,
    );
  }

  // Обновляем данные клиента
  clientData.currentChannelId = null;
  clients.set(socket, clientData);
}
