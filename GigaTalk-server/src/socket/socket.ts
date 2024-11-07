import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { handleMessage } from './messageHandler.ts';
import { handleDisconnect } from './disconnectHandler.ts';
import { clients, JWT_SECRET } from '../data.ts';
import { socketController } from '../controllers/SocketController.ts';
import { connectSocketRoom } from './soketFunctions.ts';
import { handleMediasoupRequest } from '../mediasoup/mediasoupManager.ts';

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

  io.use((socket, next) => {
    // Извлекаем токен из URL при подключении
    const token = socket.handshake.query.token as string;

    if (!token) {
      // Отказываем в подключении, если токен отсутствует
      return next(new Error(`${cyan}Socket:${reset} Token is required`));
    }

    try {
      // Проверка токена
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        username: string;
        userAvatar: string;
        permission: number;
      };
      const { id, username, userAvatar, permission } = decoded;

      // Сохраняем данные пользователя в socket.data для дальнейшего использования
      socket.data.user = {
        userId: id,
        username,
        userAvatar,
        permission,
      };

      clients.set(socket, {
        userId: id,
        username,
        userAvatar,
        permission,
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

      next();
    } catch (error) {
      // Отклоняем подключение при ошибке аутентификации
      return next(new Error(`${cyan}Socket:${reset} Authentication error`));
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
