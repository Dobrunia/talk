import { userApi } from '../api/userApi.ts';
import { toggleMicrophoneMute, toggleSoundMute } from '../mediasoupClient/muteControls.ts';
import {
  handleJoinMediasoupRoom,
  sendSocketMessage,
} from '../socket/socket.ts';
import { serverDATA } from '../types/types.ts';
import { renderProfile, renderServerInfo, toggleMicVisual, toggleSoundVisual } from '../ui-kit/index.ts';
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
  handleJoinMediasoupRoom(channelId);
  document.getElementById('in_conversation_things')?.classList.remove('hidden');
  currentChannelId = channelId;
}

function voiceChannelLeave() {
  sendSocketMessage({ type: 'leave_channel' });
  document.getElementById('in_conversation_things')?.classList.add('hidden');
  currentChannelId = null;
}

// async function handleNicknameChange(event: Event): Promise<void> {
//   event.preventDefault();
//   try {
//     const nicknameInput = document.getElementById(
//       'change_nickname',
//     ) as HTMLInputElement | null;

//     if (nicknameInput && nicknameInput.value.trim()) {
//       const response = await userApi.changeUsername(nicknameInput.value.trim());
//       localStorage.setItem('username', response.username);
//       renderProfile();
//       closeProfileModal();
//       console.log('Новый ник:', response.username);
//       alert('Имя пользователя успешно обновлено');
//     } else {
//       alert('Введите новый ник');
//     }
//   } catch (error) {
//     console.error('Ошибка при изменении ника:', error);
//     alert('Произошла ошибка при изменении ника. Попробуйте позже.');
//   }
// }

function closeProfileModal() {
  const profileModal = document.getElementById('profileModal');
  if (profileModal) {
    profileModal.classList.add('hidden');
  }
}

async function handleAvatarChange(event: Event): Promise<void> {
  event.preventDefault();
  const avatarInput = document.getElementById(
    'change_avatar',
  ) as HTMLInputElement | null;

  if (avatarInput && avatarInput.files && avatarInput.files.length > 0) {
    const file = avatarInput.files[0];
    const reader = new FileReader();

    reader.onload = async function () {
      if (reader.result) {
        const base64String = reader.result.toString();

        try {
          const response = await userApi.changeAvatar(base64String);

          if (response && response.userAvatar) {
            console.log('Аватар успешно обновлен:', response);
            localStorage.setItem('userAvatar', response.userAvatar);
            renderProfile();
            closeProfileModal();
            alert(response.message || 'Аватар успешно обновлен');
          } else {
            console.error('Ошибка сервера:', response);
            alert(
              `Ошибка: ${response.message || 'Не удалось обновить аватар'}`,
            );
          }
        } catch (error) {
          if (error.response.status === 413) {
            alert(`Ошибка: Размер файла слишком велик. Пожалуйста, выберите файл меньшего размера.`);
            return;
          }
          console.error('Ошибка при отправке данных на сервер:', error);
          alert('Произошла ошибка при обновлении аватара. Попробуйте позже.');
        }
      }
    };

    reader.onerror = function () {
      console.error('Ошибка при чтении файла:', reader.error);
      alert('Произошла ошибка при преобразовании файла.');
    };

    reader.readAsDataURL(file); // Инициализация чтения файла как Data URL
  } else {
    alert('Выберите файл аватара');
  }
}

function logOut() {
  const confirmation = window.confirm("Вы уверены, что хотите выйти?");
  if (confirmation) {
    // Логика выхода из аккаунта
    console.log("Выход из аккаунта выполнен");
    // Здесь можно добавить логику для выхода, например, перенаправление на страницу входа
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userAvatar');
    window.location.reload(); // Обновление страницы для удаления всех сессий и кэшированных данных
  } else {
    console.log("Выход из аккаунта отменен");
  }
}

function microphoneMute() {
  toggleMicrophoneMute();
  toggleMicVisual();
}

function soundMute() {
  toggleSoundMute();
  toggleSoundVisual();
  toggleMicVisual();
}

window.voiceChannelClick = voiceChannelClick;
window.voiceChannelLeave = voiceChannelLeave;
window.serverClickHandler = serverClickHandler;
window.guestLoginHandler = guestLoginHandler;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.showLogin = showLogin;
window.showRegister = showRegister;
// window.handleNicknameChange = handleNicknameChange;
window.handleAvatarChange = handleAvatarChange;
window.closeProfileModal = closeProfileModal;
window.logOut = logOut;
window.microphoneMute = microphoneMute;
window.soundMute = soundMute;
