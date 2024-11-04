import { sendSocketMessage } from '../socket/socket.ts';
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
      type: 'update_server_users_in_channels',
      serverId,
    });
    console.log('Отрисовали активных пользователей сервера');
  } else {
    console.error('Failed to load server info');
    return;
  }
}

let currentChannelId: string | null = null;
async function voiceChannelClick(serverId: string, channelId: string) {
  if (channelId === currentChannelId) {
    console.log('Вы уже в этом канале');
    return;
  }

  sendSocketMessage({
    type: 'join_channel',
    serverId,
    channelId,
  });
  document.getElementById('in_conversation_things')?.classList.remove('hidden');
  currentChannelId = channelId;
}

function voiceChannelLeave() {
  const serverId = document
    .getElementById('server_id')
    ?.getAttribute('data-serverId');
  if (!serverId) {
    console.error('Server ID not found!');
    return;
  }

  sendSocketMessage({
    type: 'leave_channel',
    serverId,
    channelId: currentChannelId as string,
  });
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
