import { Request, Response, NextFunction } from 'express';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Ошибка:', error); // Логирование ошибки для отладки

  // Определяем статус ошибки (например, если ошибка от базы данных)
  const statusCode = error.status || 500;

  // Формируем сообщение об ошибке для клиента
  const message = error.message || 'Внутренняя ошибка сервера';

  res.status(statusCode).json({
    error: message,
  });
};
