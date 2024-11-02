import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';

type ClientData = {
  userId: string;
  username: string;
  userAvatar: string;
  channelId: string | null;
};

// Структуры данных для управления комнатами
const servers: Record<string, Set<WebSocket>> = {}; // Комнаты-сервера
const clients = new Map<WebSocket, ClientData>();

// Настройка WebSocket
export function setupWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    const clientId = uuidv4();
    clients.set(ws, {
      userId: clientId,
      username: `User-${clientId}`,
      userAvatar: 'defaultAvatar',
      channelId: null,
    });

    console.log(`WebSocket connection established with ID: ${clientId}`);

    ws.on('message', (message: string) => handleSocketMessage(ws, message));
    ws.on('close', () => handleClientDisconnect(ws));
  });
}

// Обработка сообщений WebSocket
function handleSocketMessage(ws: WebSocket, message: string) {
  const data = JSON.parse(message);
  switch (data.type) {
    case 'join_server':
      joinServerRoom(ws, data.serverId, data.userId, data.username, data.userAvatar);
      break;
    case 'join_channel':
      joinChannel(ws, data.serverId, data.channelId);
      break;
    case 'leave_channel':
      leaveChannel(ws, data.serverId, data.channelId);
      break;
    case 'leave_server':
      leaveServerRoom(ws, data.serverId);
      break;
    default:
      console.warn('Unknown message type:', data.type);
  }
}

// Функции управления подключениями
function joinServerRoom(ws: WebSocket, serverId: string, userId: string, username: string, userAvatar: string) {
  if (!servers[serverId]) {
    servers[serverId] = new Set();
  }
  servers[serverId].add(ws);
  clients.set(ws, { userId, username, userAvatar, channelId: null });

  console.log(`User ${username} joined server ${serverId}`);
  broadcastUserList(serverId);
}

function joinChannel(ws: WebSocket, serverId: string, channelId: string) {
  const clientData = clients.get(ws);
  if (clientData) {
    clientData.channelId = channelId;
    clients.set(ws, clientData);
  }
  console.log(`User ${clientData?.username} joined channel ${channelId} on server ${serverId}`);
  broadcastUserList(serverId);
}

function leaveChannel(ws: WebSocket, serverId: string, channelId: string) {
  const clientData = clients.get(ws);
  if (clientData) {
    clientData.channelId = null;
    clients.set(ws, clientData);
  }
  console.log(`User ${clientData?.username} left channel ${channelId} on server ${serverId}`);
  broadcastUserList(serverId);
}

function leaveServerRoom(ws: WebSocket, serverId: string) {
  if (servers[serverId]) {
    servers[serverId].delete(ws);
    if (servers[serverId].size === 0) {
      delete servers[serverId];
      console.log(`Server room ${serverId} deleted as it is empty.`);
    }
  }
  console.log(`User ${clients.get(ws)?.username} left server ${serverId}`);
  broadcastUserList(serverId);
}

function handleClientDisconnect(ws: WebSocket) {
  clients.delete(ws);
  for (const serverId in servers) {
    servers[serverId].delete(ws);
    if (servers[serverId].size === 0) {
      delete servers[serverId];
    }
    broadcastUserList(serverId);
  }
}

// Функция для отправки обновленного списка пользователей всем в сервере
function broadcastUserList(serverId: string) {
  if (servers[serverId]) {
    const usersInServer = Array.from(servers[serverId]).map((client) => clients.get(client));
    const userListMessage = JSON.stringify({
      type: 'update_users',
      serverId,
      users: usersInServer.map((user) => ({
        userId: user?.userId,
        username: user?.username,
        userAvatar: user?.userAvatar,
        channelId: user?.channelId,
      })),
    });

    servers[serverId].forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(userListMessage);
      }
    });
  }
}
