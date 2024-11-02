import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

type ClientData = {
  userId: string;
  username: string;
  userAvatar: string;
  channelId: string | null;
};

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const servers: Record<string, Set<WebSocket>> = {};
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
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, username: string, userAvatar: string };
      const { userId, username, userAvatar } = decoded;

      clients.set(ws, {
        userId,
        username,
        userAvatar,
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
