import './ui-kit/style.css';
import { getInCheck } from './utils/authController.ts';
import { logInRender } from './utils/render.ts';
import { connectSocket } from './socket/socket.ts';

async function start() {
  if (await getInCheck()) {
    logInRender();
    // Запускаем соединение WebSocket
    // connectSocket();
  }
}

window.onload = () => {
  start();
};
