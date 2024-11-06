import { Socket } from 'socket.io';
import { ClientData } from '../types/types.ts';

const cyan = '\x1b[36m';
const reset = '\x1b[0m';

/**
 * Присоединяет пользователя к комнате и уведомляет других участников.
 * @param socket - объект сокета, представляющий подключение пользователя
 * @param roomId - идентификатор комнаты (например, serverId)
 * @param client - данные пользователя, присоединяющегося к комнате
 */
export function connectRoom(
  socket: Socket,
  roomId: string,
  client: ClientData,
): void {
  // Добавляем сокет в комнату с помощью встроенного метода join
  socket.join(roomId);

  // Уведомляем всех остальных пользователей в комнате, что новый пользователь присоединился
  const data = {
    type: 'user_online',
    message: client,
  };
  socket.broadcast.to(roomId).emit('message', JSON.stringify(data));
  socket.emit('message', JSON.stringify(data));
  console.log(
    `${cyan}Socket:${reset} User ${client.username} joined room ${roomId}`,
  );
}
