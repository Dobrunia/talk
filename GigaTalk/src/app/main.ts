import { setMyServersList } from '../entities/server/model/actions.ts';
import { getInCheck } from '../features/auth/model/actions.ts';
import { renderAuthModal } from '../features/auth/ui/AuthModal.ts';
import { renderProfile } from '../features/profile/ui/myProfile.ts';
import { renderProfileModal } from '../features/profile/ui/ProfileModal.ts';
import { renderServersList } from '../features/serverComponent/model/actions.ts';
import { renderSettingsModal } from '../features/settings/ui/SettingsModal.ts';
import { connectSocket } from './api/socket/socket.ts';
import './style.css';

function logInRender() {
  renderProfile();
  renderProfileModal();
  setMyServersList();
  renderServersList();
  renderSettingsModal();
}

async function start() {
  renderAuthModal();
  if (await getInCheck()) {
    logInRender();
    connectSocket(); // Запускаем соединение WebSocket
  }
}

window.onload = () => {
  start();
};
