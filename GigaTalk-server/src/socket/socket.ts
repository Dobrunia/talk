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
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        username: string;
        userAvatar: string;
      };
      const { id, username, userAvatar } = decoded;

      clients.set(ws, {
        userId: id,
        username,
        userAvatar,
        serverId: null,
        channelId: null,
      });

      console.log(`WebSocket connection established with userId: ${id}`);

      ws.on('message', (message: string) => handleSocketMessage(ws, message));
      ws.on('close', () => handleClientDisconnect(ws));
    } catch (error) {
      console.error('Invalid token:', error);
      ws.close(1008, 'Invalid token');
    }
  });
}

// Обработка отключения клиента
function handleClientDisconnect(ws: WebSocket) {
  const clientData = clients.get(ws);
  if (clientData) {
    //if (clientData.channelId) leaveChannel(ws);
    if (clientData.serverId) leaveServer(ws);
  }
  clients.delete(ws);
  console.log(`User ${clientData?.username} disconnected`);
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
        broadcastUserJoinChannel(ws, data.serverId, data.channelId);
        break;
      case 'leave_channel':
        broadcastUserLeaveChannel(ws, data.serverId, data.channelId);
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
    broadcastUserJoinServer(serverId);
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
    broadcastUserLeaveServer(serverId);
  }
}

function broadcastUserJoinServer(serverId: string) {
  const usersInServer = Array.from(servers[serverId] || []).map((ws) =>
    clients.get(ws),
  );
  const userListMessage = JSON.stringify({
    type: 'user_join_server',
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

function broadcastUserLeaveServer(serverId: string) {
  const usersInServer = Array.from(servers[serverId] || []).map((ws) =>
    clients.get(ws),
  );
  const userListMessage = JSON.stringify({
    type: 'user_leave_server',
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

function broadcastUserJoinChannel(
  ws: WebSocket,
  serverId: string,
  channelId: string,
) {
  const clientData = clients.get(ws);
  if (!clientData) return;

  const userJoinMessage = JSON.stringify({
    type: 'user_join_channel',
    serverId,
    channelId,
    user: {
      userId: clientData.userId,
      username: clientData.username,
      userAvatar: clientData.userAvatar,
    },
  });

  servers[serverId]?.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(userJoinMessage);
    }
  });
  console.log(`User ${clientData.username} JoinChannel ${channelId}`);
}

function broadcastUserLeaveChannel(
  ws: WebSocket,
  serverId: string,
  channelId: string,
) {
  const clientData = clients.get(ws);
  if (!clientData) return;

  const userLeaveMessage = JSON.stringify({
    type: 'user_leave_channel',
    serverId,
    channelId,
    user: {
      userId: clientData.userId,
      username: clientData.username,
      userAvatar: clientData.userAvatar,
    },
  });

  servers[serverId]?.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(userLeaveMessage);
    }
  });
  console.log(`User ${clientData.username} LeaveChannel ${channelId}`);
}
