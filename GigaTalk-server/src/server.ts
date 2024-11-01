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

// Создаем HTTP-сервер и передаем его в Express и WebSocketServer
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Объект для хранения участников по каналам
const channels: Record<string, Set<WebSocket>> = {};
// Объект для хранения уникальных идентификаторов клиентов
const clients = new Map<WebSocket, string>();

// Обработка подключений WebSocket
wss.on('connection', (ws: WebSocket) => {
  const clientId = uuidv4();
  clients.set(ws, clientId);
  console.log(`New WebSocket connection established with ID: ${clientId}`);

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received message: ${message} from client ${clientId}`);

      switch (data.type) {
        case 'join':
          handleJoin(ws, data.channelId);
          break;
        case 'offer':
          broadcastToChannel(data.channelId, ws, JSON.stringify({ type: 'offer', offer: data.offer }));
          break;
        case 'answer':
          broadcastToChannel(data.channelId, ws, JSON.stringify({ type: 'answer', answer: data.answer }));
          break;
        case 'candidate':
          broadcastToChannel(data.channelId, ws, JSON.stringify({ type: 'candidate', candidate: data.candidate }));
          break;
        case 'leave':
          handleLeave(ws, data.channelId);
          break;
        default:
          console.warn(`Unknown message type: ${data.type}`);
      }
    } catch (err) {
      console.error(`Error processing message: ${message} from client ${clientId}`, err);
    }
  });

  ws.on('close', () => {
    console.log(`Connection closed for client ${clientId}`);
    for (const channelId in channels) {
      channels[channelId].delete(ws);
    }
    clients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error(`WebSocket error for client ${clientId}:`, err);
  });
});


// Функция для подключения клиента к каналу
// Функция для подключения клиента к каналу
function handleJoin(ws: WebSocket, channelId: string) {
  // Создаем канал, если он не существует
  if (!channels[channelId]) {
    channels[channelId] = new Set();
    console.log(`Channel ${channelId} created.`);
  }

  // Добавляем пользователя в канал
  channels[channelId].add(ws);
  const userId = clients.get(ws); // Получаем ID нового пользователя
  console.log(`User with ID ${userId} joined channel ${channelId}`);

  // Отправляем уведомление всем в канале о новом участнике
  broadcastToChannel(channelId, ws, JSON.stringify({
    type: 'user_joined',
    userId: userId,
    channelId: channelId,
  }));

  // Обновляем список пользователей для всех в канале
  broadcastUserList(channelId);
}


// Функция для выхода клиента из канала
function handleLeave(ws: WebSocket, channelId: string) {
  if (channels[channelId]) {
    channels[channelId].delete(ws);
    console.log(`User with ID ${clients.get(ws)} left channel ${channelId}`);
    // Если в канале больше нет пользователей, удаляем его
    if (channels[channelId].size === 0) {
      delete channels[channelId];
      console.log(`Channel ${channelId} deleted as it is empty.`);
    }
    // Обновляем список пользователей для всех оставшихся клиентов
    broadcastUserList(channelId);
  } else {
    console.warn(`Attempted to leave non-existent channel: ${channelId}`);
  }
}

// Функция для пересылки сообщений всем участникам канала, кроме отправителя
function broadcastToChannel(channelId: string, sender: WebSocket, message: string) {
  if (channels[channelId]) {
    channels[channelId].forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
    console.log(`Broadcasted message to channel ${channelId}: ${message}`);
  } else {
    console.warn(`Attempted to broadcast to non-existent channel: ${channelId}`);
  }
}

// Функция для отправки обновленного списка пользователей всем в канале
function broadcastUserList(channelId: string) {
  if (channels[channelId]) {
    const usersInChannel = Array.from(channels[channelId]).map((client) => clients.get(client));
    const userListMessage = JSON.stringify({ type: 'update_users', users: usersInChannel });
    channels[channelId].forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(userListMessage);
      }
    });
    console.log(`Updated user list broadcasted to channel ${channelId}: ${userListMessage}`);
  } else {
    console.warn(`Attempted to update user list for non-existent channel: ${channelId}`);
  }
}

// Запускаем HTTP и WebSocket серверы
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
