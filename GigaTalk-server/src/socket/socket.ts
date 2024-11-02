import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

type ClientData = {
  userId: string;
  username: string;
  userAvatar: string;
  serverId: string | null; // Новый параметр для сервера
  channelId: string | null;
};

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const servers: Record<string, Set<WebSocket>> = {}; // Серверы как комнаты
const clients = new Map<WebSocket, ClientData>();

export function setupWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req) => {
    const token = new URLSearchParams(req.url?.split('?')[1]).get('token');

    if (!token) {
      ws.close(1008, 'Token is required');
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string; userAvatar: string };
      const { userId, username, userAvatar } = decoded;

      clients.set(ws, {
        userId,
        username,
        userAvatar,
        serverId: null,
        channelId: null,
      });

      console.log(`WebSocket connection established with userId: ${userId}`);

      ws.on('message', (message: string) => handleSocketMessage(ws, message));
      ws.on('close', () => handleClientDisconnect(ws));

    } catch (error) {
      console.error('Invalid token:', error);
      ws.close(1008, 'Invalid token');
    }
  });
}

// Обработка сообщений WebSocket
function handleSocketMessage(ws: WebSocket, message: string) {
  try {
    const data = JSON.parse(message);
    switch (data.type) {
      case 'join_server':
        joinServer(ws, data.serverId);
        break;
      case 'leave_server':
        leaveServer(ws);
        break;
      case 'join_channel':
        joinChannel(ws, data.channelId);
        break;
      case 'leave_channel':
        leaveChannel(ws);
        break;
      case 'send_message':
        sendMessageToChannel(ws, data.channelId, data.message);
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  } catch (error) {
    console.error('Failed to handle message:', error);
  }
}

// Подключение к серверу
function joinServer(ws: WebSocket, serverId: string) {
  const clientData = clients.get(ws);
  if (clientData) {
    clientData.serverId = serverId;
    clients.set(ws, clientData);

    // Добавляем пользователя в сервер
    if (!servers[serverId]) {
      servers[serverId] = new Set();
    }
    servers[serverId].add(ws);

    console.log(`User ${clientData.username} joined server ${serverId}`);
    broadcastUserListInServer(serverId);
  }
}

// Отключение от сервера
function leaveServer(ws: WebSocket) {
  const clientData = clients.get(ws);
  if (clientData && clientData.serverId) {
    const { serverId } = clientData;
    clientData.serverId = null;
    clientData.channelId = null; // Удаляем из канала при выходе из сервера
    clients.set(ws, clientData);

    if (servers[serverId]) {
      servers[serverId].delete(ws);
      if (servers[serverId].size === 0) {
        delete servers[serverId];
      }
    }

    console.log(`User ${clientData.username} left server ${serverId}`);
    broadcastUserListInServer(serverId);
  }
}

// Подключение к каналу
function joinChannel(ws: WebSocket, channelId: string) {
  const clientData = clients.get(ws);
  if (clientData && clientData.serverId) { // Только если пользователь подключен к серверу
    clientData.channelId = channelId;
    clients.set(ws, clientData);
    console.log(`User ${clientData.username} joined channel ${channelId}`);
    broadcastUserListInChannel(channelId);
  }
}

// Отключение от канала
function leaveChannel(ws: WebSocket) {
  const clientData = clients.get(ws);
  if (clientData && clientData.channelId) {
    const { channelId } = clientData;
    clientData.channelId = null;
    clients.set(ws, clientData);
    console.log(`User ${clientData.username} left channel ${channelId}`);
    broadcastUserListInChannel(channelId);
  }
}

// Отправка сообщения в канал
function sendMessageToChannel(ws: WebSocket, channelId: string, message: string) {
  const clientData = clients.get(ws);
  if (clientData && clientData.channelId === channelId) {
    const payload = JSON.stringify({
      type: 'channel_message',
      channelId,
      userId: clientData.userId,
      username: clientData.username,
      message,
    });
    broadcastToChannel(channelId, payload);
  }
}

// Бродкаст всем пользователям на сервере
function broadcastUserListInServer(serverId: string) {
  const usersInServer = Array.from(servers[serverId] || []).map((ws) => clients.get(ws));
  const userListMessage = JSON.stringify({
    type: 'user_list_server',
    serverId,
    users: usersInServer.map((user) => ({
      userId: user?.userId,
      username: user?.username,
      userAvatar: user?.userAvatar,
    })),
  });

  servers[serverId]?.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(userListMessage);
    }
  });
}

// Бродкаст пользователям в канале
function broadcastUserListInChannel(channelId: string) {
  const usersInChannel = Array.from(clients.values())
    .filter((client) => client.channelId === channelId)
    .map((user) => ({
      userId: user.userId,
      username: user.username,
      userAvatar: user.userAvatar,
    }));

  const userListMessage = JSON.stringify({
    type: 'user_list_channel',
    channelId,
    users: usersInChannel,
  });

  broadcastToChannel(channelId, userListMessage);
}

// Бродкаст для канала
function broadcastToChannel(channelId: string, message: string) {
  for (const [client, clientData] of clients.entries()) {
    if (clientData.channelId === channelId && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Обработка отключения клиента
function handleClientDisconnect(ws: WebSocket) {
  const clientData = clients.get(ws);
  if (clientData) {
    if (clientData.channelId) leaveChannel(ws);
    if (clientData.serverId) leaveServer(ws);
  }
  clients.delete(ws);
  console.log(`User ${clientData?.username} disconnected`);
}
