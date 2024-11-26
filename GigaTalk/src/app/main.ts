import { setMyServersList } from '../entities/server/model/actions.ts';
import { updateMyInfo } from '../entities/user/model/actions.ts';
import { getInCheck } from '../features/auth/model/actions.ts';
import { renderProfile } from '../features/profile/ui/myProfile.ts';
import { renderProfileModal } from '../features/profile/ui/ProfileModal.ts';
import { renderServersList } from '../features/serverComponent/model/actions.ts';
import { renderSettingsModal } from '../features/settings/ui/SettingsModal.ts';
import { connectSocket } from './api/socket/socket.ts';
import './style.css';

async function logInRender() {
  await updateMyInfo();
  renderProfile();
  renderProfileModal();
  setMyServersList();
  renderServersList();
  renderSettingsModal();
}

async function start() {
  if (await getInCheck()) {
    await logInRender();
    connectSocket(); // Запускаем соединение WebSocket
  }
}

window.onload = () => {
  start();
};
