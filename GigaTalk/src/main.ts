import { userInChannel } from './ui-kit/components.ts';
import './ui-kit/style.css';
import { loadServers, serverClickHandler } from './utils/cache';
import {
  joinVoiceChannel,
  leaveVoiceChannel,
  handleAnswer,
  handleCandidate,
  handleOffer,
} from './webRTC/voiceChannel.ts';

let channelIdCheck: number = 0;
let peerConnection: RTCPeerConnection | null = null;

async function start() {
  loadServers();
}

window.onload = () => {
  start();
};

const socket = new WebSocket('ws://localhost:3000');
socket.onopen = () => {
  console.log('WebSocket connection established.');
};

// Обработка сообщений от WebSocket сервера
socket.onmessage = async (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'offer':
      await handleOffer(data.offer, socket, data.channelId); // Обработка SDP предложения с передачей channelId
      break;
    case 'answer':
      await handleAnswer(data.answer); // Обработка SDP ответа
      break;
    case 'candidate':
      await handleCandidate(data.candidate); // Обработка ICE-кандидата
      break;
    case 'user_joined':
      console.log(`User with ID ${data.userId} joined channel ${data.channelId}`);
      break;
    case 'update_users':
      updateUserList(data.users);
      break;
    default:
      console.warn('Неизвестный тип сообщения:', data.type);
  }
};

// Функция для подключения к каналу при нажатии на кнопку
function voiceChannelClick(channelId: number) {
  if (channelId === channelIdCheck) {
    console.log('Вы уже в этом канале');
    return;
  }

  joinVoiceChannel(channelId, socket);

  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');
  if (username && userId) {
    addUserToChannel(channelId, username, userId);
  } else {
    console.warn('Пользователь не найден в локальном хранилище');
  }

  // Создаем элемент audio, если его еще нет
  let remoteAudio = document.getElementById('remoteAudio') as HTMLAudioElement;
  if (!remoteAudio) {
    console.warn('Элемент remoteAudio не найден, создаем новый элемент.');
    remoteAudio = document.createElement('audio');
    remoteAudio.id = 'remoteAudio';
    remoteAudio.autoplay = true;
    document.body.appendChild(remoteAudio);
  }

  document.getElementById('in_conversation_things')?.classList.remove('hidden');
  channelIdCheck = channelId;
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
  console.log('updateUserList ' + userIds);
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
