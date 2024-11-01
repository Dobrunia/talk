// src/controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connection from '../db/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const TOKEN_EXPIRATION = '1d'; // Срок действия токена
const GUEST_EXPIRATION_DAYS = 7;  // Время жизни гостевых аккаунтов в днях

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      // Проверка существующего пользователя
      const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Добавление пользователя в БД
      const [result] = await connection.query(
        'INSERT INTO users (username, password, created_at) VALUES (?, ?, NOW())',
        [username, hashedPassword]
      );
      const userId = result.insertId;

      res.status(201).json({ message: 'Регистрация прошла успешно', userId });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      
      // Получение пользователя
      const [users] = await connection.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      if (users.length === 0) {
        return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
      }

      const user = users[0];
      
      // Проверка пароля
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
      }

      // Создание JWT токена
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
      
      // Добавление записи в `ActiveSessions`
      await connection.query(
        'INSERT INTO ActiveSessions (user_id, token, expires_at, is_guest) VALUES (?, ?, NOW() + INTERVAL 1 DAY, FALSE)',
        [user.id, token]
      );

      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  }

  async guestLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const username = `guest_${Date.now()}`;
      const password = `guest_${Math.random().toString(36).substring(2, 15)}`;
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создание гостевого пользователя
      const [result] = await connection.query(
        'INSERT INTO users (username, password, permission, created_at) VALUES (?, ?, ?, NOW())',
        [username, hashedPassword, 0]
      );
      const userId = result.insertId;

      // Создание JWT токена
      const token = jwt.sign({ id: userId, username, guest: true }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
      
      // Добавление записи в `ActiveSessions`
      await connection.query(
        'INSERT INTO ActiveSessions (user_id, token, expires_at, is_guest) VALUES (?, ?, NOW() + INTERVAL ? DAY, TRUE)',
        [userId, token, GUEST_EXPIRATION_DAYS]
      );

      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Токен не предоставлен' });
      }

      // Удаление сессии из `ActiveSessions`
      await connection.query('DELETE FROM ActiveSessions WHERE token = ?', [token]);
      res.status(200).json({ message: 'Выход выполнен успешно' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
