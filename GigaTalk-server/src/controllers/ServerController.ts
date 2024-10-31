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
}

export const serverController = new ServerController();
