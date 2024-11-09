import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import connection from '../db/connection.ts';
import { JWT_SECRET } from '../data.ts';
import { DecodedToken } from '../types/types.ts';

export async function verifyAndInitializeClientData(
  token: string,
  clients: Map<any, any>,
  socket: any,
): Promise<void> {
  try {
    // Проверка токена
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const { id } = decoded;

    // Получаем обновленные данные пользователя
    const [users] = await connection.query<RowDataPacket[]>(
      'SELECT username, avatar, permission FROM users WHERE id = ?',
      [id],
    );

    if ((users as any[]).length === 0) {
      console.log('Пользователь не найден');
      throw new Error('User not found');
    }

    const user = (users as any[])[0];

    // Инициализация clientData
    clients.set(socket, {
      socket,
      userId: id,
      username: user.username,
      userAvatar: user.avatar,
      permission: user.permission,
      transports: {
        sendTransport: null,
        recvTransport: null,
      },
      producers: {
        audioProducer: null,
        videoProducer: null,
        screenProducer: null,
      },
    });
    // Сохраняем данные пользователя в socket.data для дальнейшего использования
    socket.data.user = {
      userId: id,
    };
  } catch (error) {
    console.error(
      'Ошибка при верификации токена или инициализации clientData:',
      error,
    );
    throw new Error('Authentication error');
  }
}
