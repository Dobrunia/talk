import SVG from '../../../app/ui/svgs.ts';
import { createNetworkIndicator } from '../../networkIndicator/ui/NetworkIndicator.ts';
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

function createScreenShareBtn(): HTMLButtonElement {
  const screenShareButton = document.createElement('button');
  screenShareButton.className = 'send_track';
  screenShareButton.title = 'Продемонстрируйте свой экран';
  screenShareButton.innerHTML = SVG.screen_share;

  return screenShareButton;
}

function createCameraShareBtn(): HTMLButtonElement {
  const cameraShareButton = document.createElement('button');
  cameraShareButton.className = 'send_track';
  cameraShareButton.title = 'Включить камеру';
  cameraShareButton.innerHTML = SVG.camera_share;
  cameraShareButton.onclick = sendVideo;

  return cameraShareButton;
}

function createLeaveBtn(): HTMLButtonElement {
  const leaveButton = document.createElement('button');
  leaveButton.className = 'leave_button';
  leaveButton.title = 'Отключиться';
  leaveButton.innerHTML = SVG.leave_button;
  leaveButton.onclick = voiceChannelLeave;

  return leaveButton;
}
