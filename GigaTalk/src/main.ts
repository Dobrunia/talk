import './ui-kit/style.css';
import { getInCheck } from './utils/authController.ts';
import { logInRender } from './utils/render.ts';
import { connectSocket } from './socket/socket.ts';

async function start() {
  // if (
  //   window.location.pathname !== '/' &&
  //   window.location.pathname !== '/index.html' &&
  //   window.location.pathname !== 'src/pages/404.html'
  // ) {
  //   window.location.href = 'src/pages/404.html';
  //   return;
  // }

  if (await getInCheck()) {
    logInRender();
    connectSocket(); // Запускаем соединение WebSocket
  }
}

window.onload = () => {
  start();
};
