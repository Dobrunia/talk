import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import connection from '../db/connection.ts';

class ServerController {
  async getAllServers(req: Request, res: Response, next: NextFunction) {
    try {
      const [servers] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM `servers`',
      );
      res.status(200).json(servers);
    } catch (error) {
      next(error);
    }
  }
  async getServerById(req: Request, res: Response, next: NextFunction) {
    const { serverId } = req.params;
    try {
      const [serverData] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM `servers` WHERE id = ? AND type = "open"',
        [serverId],
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
