import { logOut } from '../model/actions.ts';

async function renderSettingsModal() {
  const settingsModal = document.createElement('div');
  settingsModal.id = 'settingsModal';
  settingsModal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  // Заголовок
  const header = document.createElement('h2');
  header.textContent = 'Настройки пользователя';
  header.className = 'modal-header';
  modalContent.appendChild(header);

  // Ползунок для громкости
  const volumeContainer = document.createElement('div');
  volumeContainer.className = 'modal-container';

  const volumeLabel = document.createElement('label');
  volumeLabel.htmlFor = 'volume';
  volumeLabel.textContent = 'Громкость';
  volumeLabel.className = 'modal-label';
  volumeContainer.appendChild(volumeLabel);

  const volumeInput = document.createElement('input');
  volumeInput.type = 'range';
  volumeInput.id = 'volume';
  volumeInput.min = '0';
  volumeInput.max = '100';
  volumeInput.className = 'modal-range';
  volumeContainer.appendChild(volumeInput);

  modalContent.appendChild(volumeContainer);

  // Выбор микрофона
  const micContainer = document.createElement('div');
  micContainer.className = 'modal-container';

  const micLabel = document.createElement('label');
  micLabel.htmlFor = 'microphone';
  micLabel.textContent = 'Выбор микрофона';
  micLabel.className = 'modal-label';
  micContainer.appendChild(micLabel);

  const micSelect = document.createElement('select');
  micSelect.id = 'microphone';
  micSelect.className = 'modal-select';
  micContainer.appendChild(micSelect);

  modalContent.appendChild(micContainer);

  // Кнопка выхода
  const logoutButton = document.createElement('button');
  logoutButton.textContent = 'Выйти из аккаунта';
  logoutButton.className = 'button button-primary';
  logoutButton.onclick = () => logOut();
  modalContent.appendChild(logoutButton);

  // Кнопка закрытия
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Закрыть';
  closeButton.className = 'button button-secondary';
  closeButton.onclick = () => settingsModal.classList.add('hidden');
  modalContent.appendChild(closeButton);

  settingsModal.appendChild(modalContent);
  document.body.appendChild(settingsModal);

  // Заполнение списка микрофонов
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    // Фильтруем только устройства ввода звука (микрофоны)
    const audioInputs = devices.filter(
      (device) => device.kind === 'audioinput',
    );

    // Очищаем текущие опции перед добавлением
    micSelect.innerHTML = '';

    // Добавляем каждое устройство как опцию
    audioInputs.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Микрофон ${index + 1}`;
      micSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Ошибка при получении устройств:', error);
  }
}
