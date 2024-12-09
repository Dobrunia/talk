import { sendSocketMessage } from '../../../app/api/socket/socket.ts';
import { getSendTransport } from '../../../app/mediasoupClient/mediasoupClientSetup.ts';
import {
  closeVideoProducer,
  createVideoTrack,
} from '../../../app/mediasoupClient/services/videoTrackService.ts';
import { resetCurrentChannel } from '../../../entities/user/model/actions.ts';
import { mediaStore } from './store.ts';

async function startVideoStream() {
  const sendTransport = getSendTransport();
  await createVideoTrack(sendTransport);
  console.log('sendVideo');
}

function stopVideoStream() {
  closeVideoProducer();
  console.log('Stream off');
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
