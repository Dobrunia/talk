import {
  handleJoinMediasoupRoom,
  sendSocketMessage,
} from '../../../app/api/socket/socket.ts';
import { createMediaControls } from '../../../features/mediaControls/ui/mediaControls.ts';
import { setCurrentChannel } from '../../user/model/actions.ts';
import { getCurrentChannel } from '../../user/model/selectors.ts';

export async function voiceChannelClick(channelId: string) {
  let currentChannelId = getCurrentChannel();
  if (channelId === currentChannelId) {
    console.log('Вы уже в этом канале');
    return;
  }
  setCurrentChannel(channelId);
  sendSocketMessage({
    type: 'join_channel',
    channelId,
  });
  handleJoinMediasoupRoom(channelId);
  createMediaControls();
  document.getElementById('in_conversation_things')?.classList.remove('hidden');
}
