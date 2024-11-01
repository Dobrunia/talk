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
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };

    // Проверка, активна ли сессия
    const [sessions] = await connection.query('SELECT * FROM active_sessions WHERE token = ?', [token]);
    if ((sessions as any[]).length === 0) {
      return res.status(401).json({ error: 'Сессия не активна или токен недействителен' });
    }

    // Добавление userId в объект req для дальнейшего использования
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
};
