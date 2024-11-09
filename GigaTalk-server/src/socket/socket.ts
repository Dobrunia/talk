import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { handleMessage } from './messageHandler.ts';
import { handleDisconnect } from './disconnectHandler.ts';
import { clients, JWT_SECRET } from '../data.ts';
import { socketController } from '../controllers/SocketController.ts';
import { connectSocketRoom } from './soketFunctions.ts';
import { handleMediasoupRequest } from '../mediasoup/mediasoupManager.ts';
import connection from '../db/connection.ts';
import { RowDataPacket } from 'mysql2';
import { verifyAndInitializeClientData } from '../utils/authSocketUtils.ts';

const cyan = '\x1b[36m';
const reset = '\x1b[0m';

export function initializeSocket(server: HttpServer): Server {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.query.token as string;

    if (!token) {
      return next(new Error('Token is required'));
    }

    try {
      await verifyAndInitializeClientData(token, clients, socket);
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(
      `${cyan}Socket:${reset} WebSocket connection established with userId: ${socket.data.user.userId}`,
    );
    initializeSocketServerRooms(socket);
    // Подключаем обработчик события 'message'
    socket.on('message', (data) => handleMessage(socket, data));

    // Общий обработчик для всех событий 'mediasoup'
    socket.on('mediasoup', (data, callback) => {
      handleMediasoupRequest(socket, data, callback);
    });

    // Подключаем обработчик события 'disconnect'
    socket.on('disconnect', async () => await handleDisconnect(socket));
  });

  return io;
}

async function initializeSocketServerRooms(socket: Socket) {
  const clientData = clients.get(socket);
  if (!clientData) return;

  const serverIds = await socketController.getAllMyServerIds(clientData.userId);
  if (!serverIds) return;
  serverIds.forEach((serverId) => {
    connectSocketRoom(socket, serverId, clientData);
  });
}
