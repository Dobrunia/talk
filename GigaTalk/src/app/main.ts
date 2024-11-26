import './ui-kit/style.css';
import { getInCheck } from './utils/authController.ts';
import { logInRender } from './utils/render.ts';
import { connectSocket } from './socket/socket.ts';

async function start() {
  if (await getInCheck()) {
    logInRender();
    connectSocket(); // Запускаем соединение WebSocket
  }
}

window.onload = () => {
  start();
};
export function logInRender() {
  renderProfile();
  renderServers();
  renderSettings();
  populateMicrophoneSelect();
}