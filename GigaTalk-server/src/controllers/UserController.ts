import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import connection from '../db/connection.ts';

class UserController {
  async changeAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { base64String } = req.body;

      if (!base64String) {
        return res.status(400).json({ message: 'файл фотографии обязателен' });
      }

      await connection.query<RowDataPacket[]>(
        `UPDATE users SET userAvatar = ? WHERE id = ?`,
        [base64String, userId],
      );

      console.log('Аватар изменен для userId ' + userId);
      res.status(200).json({ message: 'Аватар успешно обновлен' });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
