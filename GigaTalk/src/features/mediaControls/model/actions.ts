import { sendSocketMessage } from '../../../app/api/socket/socket.ts';
import { getSendTransport } from '../../../app/mediasoupClient/mediasoupClientSetup.ts';
import { createVideoTrack } from '../../../app/mediasoupClient/services/videoTrackService.ts';
import { resetCurrentChannel } from '../../../entities/user/model/actions.ts';

export async function sendVideo() {
  const sendTransport = getSendTransport();
  await createVideoTrack(sendTransport);
  console.log('sendVideo');
}

export function voiceChannelLeave() {
  sendSocketMessage({ type: 'leave_channel' });
  document.getElementById('in_conversation_things')?.classList.add('hidden');
  resetCurrentChannel();
}