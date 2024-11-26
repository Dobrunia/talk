import { getInCheck } from '../features/auth/model/actions.ts';
import { connectSocket } from './api/socket/socket.ts';
import './ui-kit/style.css';

function logInRender() {
  renderProfile();
  renderServers();
  renderSettings();
  populateMicrophoneSelect();
}

async function start() {
  if (await getInCheck()) {
    logInRender();
    connectSocket(); // Запускаем соединение WebSocket
  }
}

window.onload = () => {
  start();
};
