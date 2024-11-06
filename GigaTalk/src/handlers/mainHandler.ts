import { handleJoinRoom, sendSocketMessage } from '../socket/socket.ts';
import { serverDATA } from '../types/types.ts';
import { renderServerInfo } from '../ui-kit/index.ts';
import {
  guestLoginHandler,
  handleLogin,
  handleRegister,
} from '../utils/authController.ts';
import { showLogin, showRegister } from '../utils/authUIController.ts';
import { updateCache } from '../utils/cache.ts';

async function serverClickHandler(serverId: string) {
  await updateCache.serverInfo(serverId);
  const updatedServerData = localStorage.getItem(`server_${serverId}`);
  if (updatedServerData) {
    const serverData = JSON.parse(updatedServerData) as serverDATA;
    renderServerInfo(serverData);
    console.log('Отрисовка обновлённых данных сервера');
    sendSocketMessage({
      type: 'user_opened_server',
      serverId,
    });
    console.log('Отрисовали активных пользователей сервера');
  } else {
    console.error('Failed to load server info');
    return;
  }
}

let currentChannelId: string | null = null;
async function voiceChannelClick(channelId: string) {
  if (channelId === currentChannelId) {
    console.log('Вы уже в этом канале');
    return;
  }
  sendSocketMessage({
    type: 'join_channel',
    channelId,
  });
  handleJoinRoom(channelId);
  document.getElementById('in_conversation_things')?.classList.remove('hidden');
  currentChannelId = channelId;
}

function voiceChannelLeave() {
  sendSocketMessage({ type: 'leave_channel' });
  document.getElementById('in_conversation_things')?.classList.add('hidden');
  currentChannelId = null;
}

window.voiceChannelClick = voiceChannelClick;
window.voiceChannelLeave = voiceChannelLeave;
window.serverClickHandler = serverClickHandler;
window.guestLoginHandler = guestLoginHandler;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.showLogin = showLogin;
window.showRegister = showRegister;
