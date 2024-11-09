import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connection from '../db/connection.ts';
import {
  GUEST_EXPIRATION_DAYS,
  JWT_SECRET,
  TOKEN_EXPIRATION,
} from '../data.ts';

class AuthController {
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { username, password } = req.body;

      // Проверка существующего пользователя
      const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
      );
      if ((existingUsers as any[]).length > 0) {
        res
          .status(400)
          .json({ error: 'Пользователь с таким именем уже существует' });
        return;
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      // Добавление пользователя в БД
      const [result] = await connection.query(
        'INSERT INTO users (username, password, created_at) VALUES (?, ?, NOW())',
        [username, hashedPassword],
      );
      const userId = (result as any).insertId;

      res.status(201).json({ message: 'Регистрация прошла успешно', userId });
      return;
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;

      // Проверка пользователя
      const [users] = await connection.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
      );
      if ((users as any[]).length === 0) {
        res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        return;
      }

      const user = (users as any[])[0];
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        return;
      }

      // Создание JWT токена с userAvatar
      const token = await authController.createAndStoreToken(user.id);

      // Возвращаем токен, userId, username и userAvatar
      res.status(200).json({
        token,
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar,
        permission: user.permission,
      });
    } catch (error) {
      next(error);
    }
  }

  async guestLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const username = `guest_${Date.now()}`;
      const password = `guest_${Math.random().toString(36).substring(2, 15)}`;
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создание гостевого пользователя
      const [result] = await connection.query(
        'INSERT INTO users (username, password, permission, created_at) VALUES (?, ?, ?, NOW())',
        [username, hashedPassword, 0],
      );
      const userId = (result as any).insertId;

      // Создание JWT токена
      const token = jwt.sign(
        { id: userId, username, guest: true },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION },
      );

      // Добавление записи в `ActiveSessions`
      await connection.query(
        'INSERT INTO ActiveSessions (user_id, token, expires_at, is_guest) VALUES (?, ?, NOW() + INTERVAL ? DAY, TRUE)',
        [userId, token, GUEST_EXPIRATION_DAYS],
      );

      res.status(200).json({ token });
      return;
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ error: 'Токен не предоставлен' });
        return;
      }

      // Удаление сессии из `ActiveSessions`
      await connection.query('DELETE FROM ActiveSessions WHERE token = ?', [
        token,
      ]);
      res.status(200).json({ message: 'Выход выполнен успешно' });
      return;
    } catch (error) {
      next(error);
    }
  }

  async verifyToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const token = req.headers.authorization?.split(' ')[1]; // Получаем токен из заголовка
    if (!token) {
      res.status(401).json({ error: 'Токен отсутствует' });
      return;
    }

    try {
      // Проверяем токен
      const decoded = jwt.verify(token, JWT_SECRET);
      // Возвращаем успешный ответ, если токен валиден
      res.status(200).json({ valid: true, decoded });
    } catch (error) {
      res.status(401).json({ error: 'Недействительный токен' });
    }
  }

  async createAndStoreToken(userId: number): Promise<string> {
    // Генерация нового JWT токена
    const newToken = jwt.sign(
      {
        id: userId,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION },
    );

    // Добавление записи в `active_sessions`
    try {
      await connection.query(
        'INSERT INTO active_sessions (user_id, token, expires_at, is_guest) VALUES (?, ?, NOW() + INTERVAL 1 DAY, FALSE)',
        [userId, newToken],
      );
      console.log(`Токен успешно создан и сохранен для userId ${userId}`);
    } catch (error) {
      console.error('Ошибка при добавлении записи в active_sessions:', error);
      throw new Error('Ошибка при добавлении сессии');
    }

    return newToken;
  }
}

export const authController = new AuthController();
