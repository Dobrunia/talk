import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import connection from '../db/connection.ts';

class ServerController {
  async getAllMyServers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      console.log('getAllMyServers userId ' + userId)
      const [servers] = await connection.query<RowDataPacket[]>(
        'SELECT servers.* FROM servers JOIN server_members ON servers.id = server_members.server_id WHERE server_members.member_id = ?',
        [userId]
      );
      res.status(200).json(servers);
    } catch (error) {
      next(error);
    }
  }
  async getMyServerInfoById(req: Request, res: Response, next: NextFunction) {
    try {
      const { serverId } = req.params;
      const userId = (req as any).userId;
      const [serverData] = await connection.query<RowDataPacket[]>(
        'SELECT servers.* FROM servers LEFT JOIN server_members ON servers.id = server_members.server_id AND server_members.member_id = ? WHERE servers.id = ? AND (servers.type = "open" OR (servers.type = "private" AND server_members.member_id IS NOT NULL))',
        [userId, serverId]
      );

      const server = serverData[0];
      const [categories] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM `categories` WHERE server_id = ?',
        [serverId],
      );
      const categoryPromises = categories.map(async (category: any) => {
        const [channels] = await connection.query<RowDataPacket[]>(
          'SELECT * FROM `channels` WHERE `category_id` = ?',
          [category.id],
        );
        return {
          ...category,
          channels,
        };
      });

      const categoriesWithChannels = await Promise.all(categoryPromises);
      const serverWithCategoriesAndChannels = {
        ...server,
        categories: categoriesWithChannels,
      };
      res.status(200).json(serverWithCategoriesAndChannels);
    } catch (error) {
      next(error);
    }
  }
}

export const serverController = new ServerController();
