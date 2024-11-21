import { Socket } from 'socket.io';
import {
  clients,
  getUserCurrentChannelId,
  removeUserFromChannel,
} from '../data.ts';
import { ClientData } from '../types/types.ts';
import { socketController } from '../controllers/SocketController.ts';
import { leaveChannel } from './messageHandler.ts';

const cyan = '\x1b[36m';
const reset = '\x1b[0m';

export async function handleDisconnect(socket: Socket): Promise<void> {
  // // Удаляем из map с каналами, если пользователь в каком-то сидел
  // const clientData = clients.get(socket);
  // if (!clientData) return;
  // const chId = getUserCurrentChannelId(clientData);
  // if (!chId) return;
  // console.log('clientData', clientData);
  // const roomId = await socketController.getServerIdByChannelId(chId);
  // removeUserFromChannel(socket);
  // console.log('roomId', roomId, 'clientData', clientData);
  // if (!roomId) return;
  // // Отправляем всем в комнате, включая отправителя, информацию о пользователе
  // const data = {
  //   type: 'user_leave_channel',
  //   userId: clientData.userId,
  // };
  // socket.to(roomId).emit('message', data); // Отправляем другим пользователям
  await leaveChannel(socket);
  // Удаляем данные клиента из `clients` после отключения
  clients.delete(socket);
  console.log(
    `${cyan}Socket:${reset} Client disconnected: ${socket.data.user.id}`,
  );
}

// function disconnectRoom(
//   socket: Socket,
//   roomId: string,
//   client: ClientData,
// ): void {
//   // Добавляем сокет в комнату с помощью встроенного метода join
//   socket.leave(roomId);

//   // Уведомляем всех остальных пользователей в комнате, что новый пользователь отключился
//   const data = {
//     type: 'user_offline',
//     client,
//   };
//   socket.broadcast.to(roomId).emit('message', JSON.stringify(data));

//   console.log(
//     `${cyan}Socket:${reset} User ${client.username} left room ${roomId}`,
//   );
// }
