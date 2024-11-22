import { serverDATA } from '../types/types.ts';
import {
  renderProfile,
  renderServersList,
  renderSettings,
} from '../ui-kit/index.ts';
import { updateCache } from './cache.ts';

async function loadServers() {
  const cachedServers = localStorage.getItem('serversList');
  let serversList: serverDATA[] = [];
  console.log('loadServers');

  if (cachedServers) {
    try {
      console.log('loadServers cached');
      serversList = JSON.parse(cachedServers) as serverDATA[];
      renderServersList(serversList);
    } catch (error) {
      console.error('Failed to parse cached servers list:', error);
    }
  }

  if (serversList.length === 0) {
    await updateCache.serversList();
    const updatedServersList = localStorage.getItem('serversList');
    console.log('loadServers api');

    if (updatedServersList && updatedServersList.length === 0) {
      serversList = JSON.parse(updatedServersList) as serverDATA[];
      renderServersList(serversList);
    }
  }
}

async function populateMicrophoneSelect() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const microphoneSelect = document.getElementById('microphone');
    if (!microphoneSelect) {
      console.error('Microphone select element not found!');
      return;
    }

    // Фильтруем только устройства ввода звука (микрофоны)
    const audioInputs = devices.filter(
      (device) => device.kind === 'audioinput',
    );

    // Очищаем текущие опции перед добавлением
    microphoneSelect.innerHTML = '';

    // Добавляем каждое устройство как опцию
    audioInputs.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Микрофон ${index + 1}`;
      microphoneSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Ошибка при получении устройств:', error);
  }
}

export function logInRender() {
  renderProfile();
  loadServers();
  renderSettings();
  populateMicrophoneSelect();
}
