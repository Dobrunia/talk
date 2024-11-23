import { serverApi } from '../api/serverApi.ts';
import { serverDATA } from '../types/types.ts';
import {
  renderProfile,
  renderServersList,
  renderSettings,
} from '../ui-kit/index.ts';

async function renderServers() {
  let serversList: serverDATA[] = [];
  console.log('loadServers');
  serversList = await serverApi.getAllMyServers();
  renderServersList(serversList);
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
  renderServers();
  renderSettings();
  populateMicrophoneSelect();
}
