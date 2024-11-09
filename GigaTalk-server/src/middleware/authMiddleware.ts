import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import connection from '../db/connection.ts';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Токен не предоставлен' });
    return;
  }

  try {
    // Проверка валидности токена и извлечение данных пользователя
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number
    };

    // Выполняем асинхронный запрос к базе данных для проверки активной сессии
    connection
      .query<RowDataPacket[][]>(
        'SELECT * FROM active_sessions WHERE token = ? AND expires_at > NOW()',
        [token],
      )
      .then(([sessions]) => {
        if ((sessions as any[]).length === 0) {
          res
            .status(401)
            .json({ error: 'Сессия не активна или токен недействителен' });
          return;
        }

        // Добавляем данные пользователя в объект req для дальнейшего использования
        (req as any).userId = decoded.id;
        next();
      })
      .catch((error) => {
        console.error('Ошибка при проверке сессии:', error);
        res.status(500).json({ error: 'Ошибка при проверке сессии' });
      });
  } catch (error) {
    res.status(401).json({ error: 'Недействительный токен' });
  }
};
