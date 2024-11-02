import { handleSocketMessage, joinToAllMyServers, leaveFromAllMyServers } from './socketController';

let socket: WebSocket | null = null;

export function connectSocket() {
  socket = new WebSocket('ws://localhost:3000');

  socket.onopen = () => {
    joinToAllMyServers();
    console.log('WebSocket connection opened');
  };

  socket.onclose = () => {
    leaveFromAllMyServers();
    console.log('WebSocket connection closed.');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  // Перенаправление сообщений в socketController
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleSocketMessage(data);
  };
}

export function sendSocketMessage(message: object) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.warn('WebSocket connection is not open.');
  }
}
