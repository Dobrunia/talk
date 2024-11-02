// server.ts

import express from 'express';
import { router } from './router';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3000;

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  }),
);
app.use(express.json());
app.use(router);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Объект для хранения участников по комнатам (комнаты идентифицируются serverId-channelId)
const rooms: Record<string, Set<WebSocket>> = {};
const clients = new Map<WebSocket, { userId: string; username: string; userAvatar: string; channelId: string | null }>();

wss.on('connection', (ws: WebSocket) => {
  const clientId = uuidv4();
  clients.set(ws, { userId: clientId, username: `User-${clientId}`, userAvatar: `Avatar-${clientId}`, channelId: null });
  console.log(`WebSocket connection established with ID: ${clientId}`);

  ws.on('message', (message: string) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'join':
        joinRoom(ws, `${data.serverId}-${data.channelId}`, data.userId, data.username, data.userAvatar);
        break;
      case 'leave':
        leaveRoom(ws, `${data.serverId}-${data.channelId}`);
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  });

  ws.on('close', () => {
    // Удаление пользователя из всех комнат при отключении
    for (const roomId in rooms) {
      leaveRoom(ws, roomId);
    }
    clients.delete(ws);
  });
});

// Функция для добавления пользователя в комнату
function joinRoom(ws: WebSocket, roomId: string, userId: string, username: string, userAvatar: string) {
  if (!rooms[roomId]) {
    rooms[roomId] = new Set();
  }
  rooms[roomId].add(ws);
  clients.set(ws, { userId, username, userAvatar, channelId: roomId });

  console.log(`User ${username} joined room ${roomId}`);

  broadcastUserList(roomId); // Обновляем список пользователей для всех в комнате
}

// Функция для выхода пользователя из комнаты
function leaveRoom(ws: WebSocket, roomId: string) {
  if (rooms[roomId]) {
    rooms[roomId].delete(ws);

    if (rooms[roomId].size === 0) {
      delete rooms[roomId];
      console.log(`Room ${roomId} deleted as it is empty.`);
    } else {
      console.log(`User ${clients.get(ws)?.username} left room ${roomId}`);
      broadcastUserList(roomId); // Обновляем список пользователей для всех, если кто-то вышел
    }
  }
  
  // Обновляем информацию клиента в Map, чтобы сбросить channelId
  const clientInfo = clients.get(ws);
  if (clientInfo) {
    clients.set(ws, { ...clientInfo, channelId: null });
  }
}

// Отправка списка пользователей всем в комнате
function broadcastUserList(roomId: string) {
  if (rooms[roomId]) {
    const usersInRoom = Array.from(rooms[roomId]).map((client) => clients.get(client));
    const [serverId, channelId] = roomId.split('-'); // Разделяем roomId на serverId и channelId

    const userListMessage = JSON.stringify({
      type: 'update_users',
      serverId,
      channelId,
      users: usersInRoom.map((user) => ({
        userId: user?.userId,
        username: user?.username,
        userAvatar: user?.userAvatar,
      })),
    });

    rooms[roomId].forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(userListMessage);
      }
    });
  }
}

// Запуск сервера
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
