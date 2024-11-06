import { RowDataPacket } from 'mysql2';
import connection from '../db/connection.ts';

class SocketController {
  async getAllMyServerIds(userId: string) {
    try {
      // Выполняем запрос для получения только id серверов
      const [serverIds] = await connection.query<RowDataPacket[]>(
        'SELECT servers.id FROM servers JOIN server_members ON servers.id = server_members.server_id WHERE server_members.member_id = ?',
        [parseInt(userId, 10)],
      );
      // Преобразуем результат запроса в массив только ID серверов
      const ids = serverIds.map((row) => row.id);
      console.log('getAllMyServerIds userId ' + ids);
      return ids;
    } catch (error) {
      console.log('Ошибка в getAllMyServerIds', error);
    }
  }
  async getChannelsForUserInServer(userId: string, serverId: string) {
    try {
      //TODO:: тут еще нет проверки есть ли доступ к каналу
      const [channels] = await connection.query<RowDataPacket[]>(
        `SELECT channels.id, channels.name, channels.type
         FROM channels
         JOIN categories ON channels.category_id = categories.id
         JOIN servers ON categories.server_id = servers.id
         JOIN server_members ON servers.id = server_members.server_id
         WHERE server_members.member_id = ? AND servers.id = ?`,
        [parseInt(userId, 10), parseInt(serverId, 10)],
      );

      // Преобразование массива объектов в массив строк (ID каналов)
      const channelIds = channels.map((channel: RowDataPacket) =>
        channel.id.toString(),
      );
      return channelIds;
    } catch (error) {
      console.log('Ошибка в getChannelsForUserInServer', error);
    }
  }
  async getServerIdByChannelId(channelId: string): Promise<string | null> {
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT categories.server_id
         FROM channels
         JOIN categories ON channels.category_id = categories.id
         WHERE channels.id = ?`,
        [parseInt(channelId, 10)]
      );
  
      if (rows.length > 0) {
        return rows[0].server_id; // Возвращаем server_id
      } else {
        return null; // Если не найдено, возвращаем null
      }
    } catch (error) {
      console.error('Ошибка в getServerIdByChannelId:', error);
      throw error;
    }
  }
}

export const socketController = new SocketController();
