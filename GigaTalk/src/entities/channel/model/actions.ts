import {
  handleJoinMediasoupRoom,
  sendSocketMessage,
} from '../../../app/api/socket/socket.ts';
import { getCurrentChannelId } from './selectors.ts';
import channelStore from './store.ts';

export async function voiceChannelClick(channelId: string) {
  let currentChannelId = getCurrentChannelId();
  if (channelId === currentChannelId) {
    console.log('Вы уже в этом канале');
    return;
  }
  sendSocketMessage({
    type: 'join_channel',
    channelId,
  });
  handleJoinMediasoupRoom(channelId);
  document.getElementById('in_conversation_things')?.classList.remove('hidden');
}

function voiceChannelLeave() {
  sendSocketMessage({ type: 'leave_channel' });
  document.getElementById('in_conversation_things')?.classList.add('hidden');
  channelStore.clearCurrentChannel();
}
window.voiceChannelLeave = voiceChannelLeave;