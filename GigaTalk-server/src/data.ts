import { Socket } from 'socket.io';
import { ClientData, UserInfo } from './types/types.ts';
import dotenv from 'dotenv';

dotenv.config();

export const TOKEN_EXPIRATION = '10d'; // Срок действия токена
export const GUEST_EXPIRATION_DAYS = 7; // Время жизни гостевых аккаунтов в днях
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

      console.log(`Пользователи в канале ${channelId}:`, users.length);

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
  channelId: string,
  clientData: ClientData,
): void {
  // Получаем текущий массив пользователей для канала или создаем новый
  let usersInChannel = usersByChannels.get(channelId) || [];
  // Проверяем наличие пользователя и добавляем его, если его еще нет
  if (!usersInChannel.some(user => user.userId === clientData.userId)) {
    console.log(
      `Пользователь ${clientData.userId} не найден, добавляем его.`,
    );
    // Создаем новый массив с обновленным списком пользователей
    usersInChannel = [...usersInChannel, clientData];
    usersByChannels.set(channelId, usersInChannel);
    console.log(
      `Пользователь ${clientData.userId} добавлен в канал ${channelId}`,
    );
  }
}

export function getUserCurrentChannelId(
  clientData: ClientData,
): string | null {
  for (const [channelId, users] of usersByChannels.entries()) {
    // Проверяем, существует ли пользователь с таким userId в массиве
    if (users.some((user) => user.userId === clientData.userId)) {
      return channelId; // Возвращаем channelId, если пользователь найден
    }
  }
  return null; // Возвращаем null, если пользователь не найден ни в одном канале
}

export function removeUserFromChannel(socket: Socket): void {
  // Получаем данные клиента
  const clientData = clients.get(socket);
  if (!clientData) return;

  const channelId = getUserCurrentChannelId(clientData);
  if (!channelId) return; // Если текущий канал не установлен, выходим

  // Получаем массив пользователей для данного канала
  let usersInChannel = usersByChannels.get(channelId);
  if (!usersInChannel) return; // Если канал не существует, выходим

  // Находим индекс пользователя в массиве
  const userIndex = usersInChannel.findIndex(
    (user) => user.userId === clientData.userId,
  );

  // Если пользователь найден, удаляем его из массива
  if (userIndex !== -1) {
    // Создаем новый массив с удалением пользователя
    usersInChannel = [
      ...usersInChannel.slice(0, userIndex),
      ...usersInChannel.slice(userIndex + 1),
    ];
    console.log(
      `Пользователь ${clientData.username} удалён из канала ${channelId}`,
    );

    // Обновляем `Map` новым массивом
    if (usersInChannel.length > 0) {
      usersByChannels.set(channelId, usersInChannel);
    } else {
      // Если после удаления массив пуст, удаляем канал из `usersByChannels`
      usersByChannels.delete(channelId);
      console.log(
        `Канал ${channelId} удалён из usersByChannels, так как он пуст.`,
      );
    }
  }
}