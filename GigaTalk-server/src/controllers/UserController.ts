import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import connection from '../db/connection.ts';
import { authController } from './AuthController.ts';

class UserController {
  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.params.id;

      // Проверка наличия ID пользователя
      if (!userId) {
        res.status(400).json({ message: 'ID пользователя обязателен' });
        return;
      }

      // Запрос в базу данных для получения данных пользователя по ID
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ?',
        [userId],
      );

      // Проверка наличия пользователя
      if (rows.length === 0) {
        res.status(404).json({ message: 'Пользователь не найден' });
        return;
      }

      // Возвращение данные пользователя
      res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      next(error);
    }
  }
  async changeUsername(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { newUsername } = req.body;

      if (!newUsername) {
        res.status(400).json({ message: 'Новое имя пользователя обязательно' });
        return;
      }

      // Обновление имени пользователя в базе данных
      await connection.query<RowDataPacket[]>(
        'UPDATE users SET username = ? WHERE id = ?',
        [newUsername, userId],
      );

      // Получение обновленных данных пользователя
      const [updatedUsername] = await connection.query<RowDataPacket[]>(
        'SELECT username FROM users WHERE id = ?',
        [userId],
      );

      if (updatedUsername.length === 0) {
        res.status(404).json({ message: 'Пользователь не найден' });
        return;
      }

      res.status(200).json({
        message: 'Имя пользователя успешно обновлено',
        username: updatedUsername[0].username,
      });
    } catch (error) {
      console.error('Ошибка при изменении имени пользователя:', error);
      next(error);
    }
  }
  async changeAvatar(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).userId;
      const base64String = req.body.base64String;

      if (!base64String) {
        res.status(400).json({ message: 'файл фотографии обязателен' });
        return;
      }

      // Обновляем аватар в базе данных
      await connection.query<RowDataPacket[]>(
        `UPDATE users SET avatar = ? WHERE id = ?`,
        [base64String, userId],
      );

      // Получаем обновленные данные пользователя
      const [userAvatar] = await connection.query<RowDataPacket[]>(
        'SELECT avatar FROM users WHERE id = ?',
        [userId],
      );

      if ((userAvatar as any[]).length === 0) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }

      const newAvatar = (userAvatar as any[])[0];

      //тут вернуть avatar
      console.log(newAvatar);
      res.status(200).json({
        message: 'Аватар успешно обновлен',
        userAvatar: newAvatar.avatar,
      });
      return;
    } catch (error) {
      console.error('Ошибка при изменении аватара:', error);
      next(error);
    }
  }
}

export const userController = new UserController();
