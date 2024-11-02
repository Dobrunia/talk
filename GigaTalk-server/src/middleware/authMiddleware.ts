import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import connection from '../db/connection.ts';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Токен не предоставлен' });
    return;
  }

  try {
    // Проверка валидности токена
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };

    // Выполняем асинхронный запрос к базе данных
    connection.query('SELECT * FROM active_sessions WHERE token = ?', [token])
      .then(([sessions]) => {
        if ((sessions as any[]).length === 0) {
          res.status(401).json({ error: 'Сессия не активна или токен недействителен' });
          return;
        }

        // Добавление userId в объект req для дальнейшего использования
        (req as any).userId = decoded.id;
        next();
      })
      .catch((error) => {
        res.status(500).json({ error: 'Ошибка при проверке сессии' });
      });

  } catch (error) {
    res.status(401).json({ error: 'Недействительный токен' });
  }
};
