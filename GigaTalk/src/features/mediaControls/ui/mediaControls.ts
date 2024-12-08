import SVG from '../../../app/ui/svgs.ts';
import { sendVideo, voiceChannelLeave } from '../model/actions.ts';

export function createMediaControls() {
  const wrapper = document.getElementById('in_conversation_things');
  if (!wrapper) return;
  wrapper.innerHTML = '';
  wrapper.appendChild(createNetworkIndicator());
  wrapper.appendChild(createScreenShareBtn());
  wrapper.appendChild(createCameraShareBtn());
  wrapper.appendChild(createLeaveBtn());
}

function createNetworkIndicator(): HTMLDivElement {
  // Создаём контейнер для индикатора сети
  const networkIndicator = document.createElement('div');
  networkIndicator.id = 'networkIndicator';
  networkIndicator.className = 'networkIndicator';

  // Создаём полоску 1
  const bar1 = document.createElement('div');
  bar1.id = 'bar1';
  bar1.className = 'bar1';

  // Создаём полоску 2
  const bar2 = document.createElement('div');
  bar2.id = 'bar2';
  bar2.className = 'bar2';

  // Создаём полоску 3
  const bar3 = document.createElement('div');
  bar3.id = 'bar3';
  bar3.className = 'bar3';

  // Добавляем полоски в контейнер
  networkIndicator.appendChild(bar1);
  networkIndicator.appendChild(bar2);
  networkIndicator.appendChild(bar3);

  return networkIndicator;
}

function createScreenShareBtn(): HTMLButtonElement {
  const screenShareButton = document.createElement('button');
  screenShareButton.id = 'screen_share';
  screenShareButton.className = 'px-2 py-1 rounded-md hover:bg-gray-600';
  screenShareButton.title = 'Продемонстрируйте свой экран';
  screenShareButton.innerHTML = SVG.screen_share;

  return screenShareButton;
}

function createCameraShareBtn(): HTMLButtonElement {
  const cameraShareButton = document.createElement('button');
  cameraShareButton.id = 'camera_share';
  cameraShareButton.className = 'px-2 py-1 rounded-md hover:bg-gray-600';
  cameraShareButton.setAttribute('title', 'Включить камеру');
  cameraShareButton.innerHTML = SVG.camera_share;
  cameraShareButton.onclick = sendVideo;

  return cameraShareButton;
}

function createLeaveBtn(): HTMLButtonElement {
  const leaveButton = document.createElement('button');
  leaveButton.id = 'leave_button';
  leaveButton.className = 'px-2 py-1 rounded-md';
  leaveButton.setAttribute('title', 'Отключиться');
  leaveButton.innerHTML = SVG.leave_button;
  leaveButton.onclick = voiceChannelLeave;

  return leaveButton;
}
