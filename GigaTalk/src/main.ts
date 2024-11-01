import './ui-kit/style.css';
import { loadServers, serverClickHandler } from './utils/cache';

async function start() {
  loadServers();
}
window.onload = () => {
  start();
};

import {
  joinVoiceChannel,
  leaveVoiceChannel,
  handleAnswer,
  handleCandidate,
} from './webRTC/voiceChannel.ts';

const socket = new WebSocket('ws://localhost:3000'); // URL сигнального сервера

// Слушаем сообщения от WebSocket сервера
socket.onmessage = async (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'answer') {
    await handleAnswer(data.answer);
  } else if (data.type === 'candidate') {
    await handleCandidate(data.candidate);
  }
};

let channelIdCheck: number = 0;
// Функция для подключения к каналу при нажатии на кнопку
function voiceChannelClick(channelId: number) {
  if (channelId === channelIdCheck) {
    console.log('вы уже в этом канале');
    return;
  }
  joinVoiceChannel(channelId, socket);
  console.log(channelId);
  document.getElementById('in_conversation_things')?.classList.remove('hidden');
  channelIdCheck = channelId;
}

// Функция для выхода из канала при нажатии на кнопку
function voiceChannelLeave() {
  leaveVoiceChannel();
  document.getElementById('in_conversation_things')?.classList.add('hidden');
  channelIdCheck = 0;
}

window.voiceChannelClick = voiceChannelClick;
window.voiceChannelLeave = voiceChannelLeave;
window.serverClickHandler = serverClickHandler;
