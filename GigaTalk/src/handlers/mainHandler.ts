import { joinChannel, leaveChannel } from '../socket/socketController.ts';
import { serverDATA } from '../types/types.ts';
import { renderServerInfo } from '../ui-kit/index.ts';
import {
  guestLoginHandler,
  handleLogin,
  handleRegister,
} from '../utils/authController.ts';
import { showLogin, showRegister } from '../utils/authUIController.ts';
import { updateCache } from '../utils/cache.ts';

const userId = localStorage.getItem('userId') || 'anonymous';
const username = localStorage.getItem('username') || 'Guest';

async function serverClickHandler(serverId: number) {
  const cachedServerData = localStorage.getItem(`server_${serverId}`);
  let serverData: serverDATA | null = null;
  console.log('serverClickHandler');

  if (cachedServerData) {
    try {
      console.log('Отрисовываем сервер из кэша');
      serverData = JSON.parse(cachedServerData) as serverDATA;
      renderServerInfo(serverData);
    } catch (error) {
      console.error('Failed to parse cached serverData:', error);
    }
  }

  if (!serverData) {
    await updateCache.serverInfo(serverId);
    const updatedServerData = localStorage.getItem(`server_${serverId}`);
    if (updatedServerData) {
      serverData = JSON.parse(updatedServerData) as serverDATA;
      renderServerInfo(serverData);
      console.log('Отрисовываем обновлённые данные сервера');
    }
  }
}

let channelIdCheck: number = 0;
function voiceChannelClick(channelId: number) {
  if (channelId === channelIdCheck) {
    console.log('Вы уже в этом канале');
    return;
  }

  joinChannel(1, channelId, userId, username, 'img');
  document.getElementById('in_conversation_things')?.classList.remove('hidden');
  channelIdCheck = channelId;
}

function voiceChannelLeave() {
  leaveChannel(1, channelIdCheck, userId);
  document.getElementById('in_conversation_things')?.classList.add('hidden');
  channelIdCheck = 0;
}

window.voiceChannelClick = voiceChannelClick;
window.voiceChannelLeave = voiceChannelLeave;
window.serverClickHandler = serverClickHandler;
window.guestLoginHandler = guestLoginHandler;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.showLogin = showLogin;
window.showRegister = showRegister;
