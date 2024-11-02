import { sendSocketMessage } from './socket.ts';
import {
  renderUserToChannel,
  removeUserFromChannel,
  updateUsersInChannel,
} from '../ui-kit/index.ts';

export function handleSocketMessage(data: any) {
  switch (data.type) {
    case 'user_joined':
      console.log(
        `User ${data.username} (ID: ${data.userId}) joined channel ${data.channelId}`,
      );
      renderUserToChannel(data.channelId, data.userId, data.username);
      break;
    case 'user_left':
      console.log(`User ${data.userId} left channel ${data.channelId}`);
      removeUserFromChannel(data.userId);
      break;
    case 'update_users':
      updateUsersInChannel(data.channelId, data.users);
      break;
    default:
      console.warn('Unknown message type:', data.type);
  }
}

export function joinChannel(
  channelId: number,
  userId: string,
  username: string,
) {
  sendSocketMessage({
    type: 'join',
    channelId: channelId,
    userId: userId,
    username: username,
  });
}

export function leaveChannel(channelId: number, userId: string) {
  sendSocketMessage({
    type: 'leave',
    channelId: channelId,
    userId: userId,
  });
}
