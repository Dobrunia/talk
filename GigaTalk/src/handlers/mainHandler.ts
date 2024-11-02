//import { joinChannel, leaveChannel } from '../socket/socketController.ts';
import { serverDATA } from '../types/types.ts';
import { renderServerInfo, renderUserToChannel } from '../ui-kit/index.ts';
import {
  getInCheck,
  guestLoginHandler,
  handleLogin,
  handleRegister,
} from '../utils/authController.ts';
import { showLogin, showRegister } from '../utils/authUIController.ts';
import { getData, updateCache } from '../utils/cache.ts';

async function serverClickHandler(serverId: string) {
  const cachedServerData = localStorage.getItem(`server_${serverId}`);
  let serverData: serverDATA | null = null;
  console.log('serverClickHandler');

  if (cachedServerData) {
    try {
      console.log('Отрисовываем сервер из кэша');
      serverData = JSON.parse(cachedServerData) as serverDATA;
      renderServerInfo(serverData);
    } catch (error) {
      console.error('Ошибка парсинга serverData:', error);
    }
  }

  if (!serverData) {
    await updateCache.serverInfo(serverId);
    const updatedServerData = localStorage.getItem(`server_${serverId}`);
    if (updatedServerData) {
      serverData = JSON.parse(updatedServerData) as serverDATA;
      renderServerInfo(serverData);
      console.log('Отрисовка обновлённых данных сервера');
    }
  }
}

// let currentChannelId: string | null = null;
// async function voiceChannelClick(channelId: string, serverId: string) {
//   if (channelId === currentChannelId) {
//     console.log('Вы уже в этом канале');
//     return;
//   }

//   await getInCheck();
//   const DATA = getData();
//   joinChannel(serverId, channelId, DATA.userId, DATA.username, DATA.userAvatar);
//   renderUserToChannel(
//     serverId,
//     channelId,
//     DATA.userId,
//     DATA.username,
//     DATA.userAvatar,
//   );
//   document.getElementById('in_conversation_things')?.classList.remove('hidden');
//   currentChannelId = channelId;
// }

// function voiceChannelLeave(serverId: string) {
//   const DATA = getData();
//   leaveChannel(
//     serverId,
//     currentChannelId as string,
//     DATA.userId,
//     DATA.username,
//     DATA.userAvatar,
//   );
//   document.getElementById('in_conversation_things')?.classList.add('hidden');
//   currentChannelId = null;
// }

// window.voiceChannelClick = voiceChannelClick;
// window.voiceChannelLeave = voiceChannelLeave;
window.serverClickHandler = serverClickHandler;
window.guestLoginHandler = guestLoginHandler;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.showLogin = showLogin;
window.showRegister = showRegister;
