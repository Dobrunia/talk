import { RtpCapabilities } from 'mediasoup-client/lib/types';
import {
  handleSocketMessage,
  joinToAllMyServers,
  leaveFromAllMyServers,
} from './socketController';

let socket: WebSocket | null = null;

export function connectSocket() {
  socket = new WebSocket(
    `ws://localhost:3000/socket?token=${localStorage.getItem('token')}`,
  );

  socket.onopen = () => {
    console.log('WebSocket connection opened');
    joinToAllMyServers();
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed.');
    leaveFromAllMyServers();
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (socket) {
      handleSocketMessage(socket, data);
    } else {
      console.warn('WebSocket connection is not established.');
    }
  };
}

export function sendSocketMessage(message: object) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.warn('WebSocket connection is not open.');
  }
}
