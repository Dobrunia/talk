import { sendSocketMessage } from '../../../app/api/socket/socket.ts';
import { getSendTransport } from '../../../app/mediasoupClient/mediasoupClientSetup.ts';
import {
  closeVideoProducer,
  createVideoProducer,
  startMyVideoPreview,
} from '../../../app/mediasoupClient/services/videoTrackService.ts';
import { resetCurrentChannel } from '../../../entities/user/model/actions.ts';
import { stopMyVideoPreview } from '../../mediaPreviewElements/ui/video.ts';
import { mediaStore } from './store.ts';

async function startVideoStream() {
  const sendTransport = getSendTransport();
  await createVideoProducer(sendTransport);
  startMyVideoPreview();
  console.log('startVideoStream');
}

function stopVideoStream() {
  closeVideoProducer();
  stopMyVideoPreview(); //TODO: уведомление другим о удалении элемента
  console.log('stopVideoStream');
}

export function voiceChannelLeave() {
  sendSocketMessage({ type: 'leave_channel' });
  document.getElementById('in_conversation_things')?.classList.add('hidden');
  resetCurrentChannel();
}

export async function toggleCameraStream() {
  if (mediaStore.getCameraStatus()) {
    // стрим уже запущен
    stopVideoStream();
  } else {
    await startVideoStream();
  }
  mediaStore.toggleCamera();
}

export async function toggleScreenShare() {
  if (mediaStore.getScreenShareStatus()) {
    console.log('показ экрана остановлен')
  } else {
    console.log('показ экрана')
  }
  mediaStore.toggleScreenShare();
}