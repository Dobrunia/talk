import { io, Socket } from 'socket.io-client';
import { handleSocketMessage } from './socketController';

let socket: Socket | null = null;

export function connectSocket() {
  // Инициализируем соединение с передачей токена
  socket = io(import.meta.env.VITE_SERVER_HOST || 'http://localhost:3000', {
    query: {
      token: localStorage.getItem('token') || '',
    },
    autoConnect: false, // чтобы вручную управлять подключением
  });

  // Подключаемся
  socket.connect();

  socket.on('connect', () => {
    console.log('Socket.IO connection opened');
    // sendSocketMessage({ type: 'user_online' });
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO connection closed.');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });

  // Обработка входящих сообщений
  socket.on('message', (data) => {
    if (socket) {
      handleSocketMessage(data);
    } else {
      console.warn('Socket.IO connection is not established.');
    }
  });
}

// Отправка сообщений на сервер
export function sendSocketMessage(message: object) {
  if (socket && socket.connected) {
    socket.emit('message', JSON.stringify(message));
  } else {
    console.warn('Socket.IO connection is not open.');
  }
}
