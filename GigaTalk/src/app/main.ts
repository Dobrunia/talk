import { getInCheck } from '../features/auth/model/actions.ts';
import { renderAuthModal } from '../features/auth/ui/AuthModal.ts';
import { connectSocket } from './api/socket/socket.ts';
import './style.css';

async function start() {
  renderAuthModal();
  if (await getInCheck()) {
    connectSocket(); // Запускаем соединение WebSocket
  }
}

window.onload = () => {
  start();
};
