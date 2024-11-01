// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import connection from '../db/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    // Проверка валидности токена
    const decoded = jwt.verify(token, JWT_SECRET);

    // Проверка токена в `ActiveSessions`
    const [sessions] = await connection.query('SELECT * FROM ActiveSessions WHERE token = ?', [token]);
    if (sessions.length === 0) {
      return res.status(401).json({ error: 'Сессия не активна или токен недействителен' });
    }

    // Передача данных пользователя в следующий middleware
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Недействительный токен' });
  }
};
