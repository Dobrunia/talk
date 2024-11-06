import { Socket } from 'socket.io';
import { clients, removeUserFromChannel } from '../data';
import { ClientData } from '../types/types';
import { socketController } from '../controllers/SocketController';

const cyan = '\x1b[36m';
const reset = '\x1b[0m';

export async function handleDisconnect(socket: Socket): Promise<void> {
  // Удаляем из map с каналами, если пользователь в каком-то сидел
  const clientData = clients.get(socket);
  if (!clientData) return;
  if (!clientData.currentChannelId) return;
  
  console.log('clientData', clientData);
  const roomId = await socketController.getServerIdByChannelId(clientData.currentChannelId);
  removeUserFromChannel(socket);
  console.log('roomId', roomId, 'clientData', clientData)
  if (!roomId) return;
  // Отправляем всем в комнате, включая отправителя, информацию о пользователе
  const data = {
    type: 'user_leave_channel',
    userId: clientData.userId,
  };
  socket.to(roomId).emit('message', data); // Отправляем другим пользователям
  // Удаляем данные клиента из `clients` после отключения
  clients.delete(socket);
  console.log(
    `${cyan}Socket:${reset} Client disconnected: ${socket.data.user.username}`,
  );
}

function disconnectRoom(
  socket: Socket,
  roomId: string,
  client: ClientData,
): void {
  // Добавляем сокет в комнату с помощью встроенного метода join
  socket.leave(roomId);

  // Уведомляем всех остальных пользователей в комнате, что новый пользователь отключился
  const data = {
    type: 'user_offline',
    client,
  };
  socket.broadcast.to(roomId).emit('message', JSON.stringify(data));

  console.log(
    `${cyan}Socket:${reset} User ${client.username} left room ${roomId}`,
  );
}
