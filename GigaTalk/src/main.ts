import { userInChannel } from './ui-kit/components.ts';
import './ui-kit/style.css';
import { loadServers, serverClickHandler } from './utils/cache';
import {
  joinVoiceChannel,
  leaveVoiceChannel,
  handleAnswer,
  handleCandidate,
} from './webRTC/voiceChannel.ts';

async function start() {
  loadServers();
}
window.onload = () => {
  start();
};

// Создаем WebSocket соединение
const socket = new WebSocket('ws://localhost:3000');

// Обработка открытия соединения
socket.onopen = () => {
  console.log('WebSocket connection established.');
};

// Обработка сообщений от WebSocket сервера
socket.onmessage = async (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'answer':
      await handleAnswer(data.answer);
      break;
    case 'candidate':
      await handleCandidate(data.candidate);
      break;
    case 'user_joined': // Логирование при присоединении пользователя
      console.log(`User with ID ${data.userId} joined channel ${data.channelId}`);
      break;
    case 'update_users':
      updateUserList(data.users);
      break;
    default:
      console.warn('Неизвестный тип сообщения:', data.type);
  }
};


// Обработка ошибок WebSocket
socket.onerror = (error) => {
  console.error('WebSocket encountered error:', error);
};

// Обработка закрытия соединения
socket.onclose = (event) => {
  console.log(`WebSocket connection closed: ${event.reason}`);
};




// Функция ожидания открытия WebSocket соединения
function waitForWebSocketOpen(socket: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.readyState === WebSocket.OPEN) {
      resolve();
    } else {
      socket.addEventListener("open", () => resolve(), { once: true });
      socket.addEventListener("error", (err) => reject(err), { once: true });
    }
  });
}

let channelIdCheck: number = 0;
// Функция для подключения к каналу при нажатии на кнопку
async function voiceChannelClick(channelId: number) {
  if (channelId === channelIdCheck) {
    console.log('Вы уже в этом канале');
    return;
  }

  try {
    await waitForWebSocketOpen(socket); // Ожидаем открытия WebSocket-соединения

    // Отправляем команду на присоединение к каналу
    socket.send(JSON.stringify({ type: 'join', channelId }));
    joinVoiceChannel(channelId, socket);

    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    if (username && userId) {
      addUserToChannel(channelId, username, userId);
    } else {
      console.warn('Пользователь не найден в локальном хранилище');
    }

    document.getElementById('in_conversation_things')?.classList.remove('hidden');
    channelIdCheck = channelId;
  } catch (error) {
    console.error("WebSocket connection could not be opened:", error);
  }
}



// Функция для добавления пользователя в отображение канала
function addUserToChannel(channelId: number, username: string, userId: string) {
  const userListElement = document.getElementById(`user_list_${channelId}`);
  if (userListElement) {
    userListElement.insertAdjacentHTML(
      'beforeend',
      userInChannel(username, userId),
    );
  }
}

// Функция для обновления списка пользователей в канале
function updateUserList(userIds: string[]) {
  console.log('updateUserList ' + userIds)
  const channelUserList = document.getElementById(`user_list_${channelIdCheck}`);
  if (channelUserList) {
    channelUserList.innerHTML = '';
    userIds.forEach((id) => {
      const username = localStorage.getItem(`username_${id}`);
      if (username) {
        channelUserList.insertAdjacentHTML('beforeend', userInChannel(username, id));
      }
    });
  }
}

// Функция для выхода из канала при нажатии на кнопку
function voiceChannelLeave() {
  leaveVoiceChannel();

  const userId = localStorage.getItem('userId');
  if (userId) {
    const userElement = document.getElementById(`user_in_channel_${userId}`);
    userElement?.remove();
  }

  document.getElementById('in_conversation_things')?.classList.add('hidden');
  channelIdCheck = 0;
}

// Подключаем функции к окну для доступа через HTML
window.voiceChannelClick = voiceChannelClick;
window.voiceChannelLeave = voiceChannelLeave;
window.serverClickHandler = serverClickHandler;
