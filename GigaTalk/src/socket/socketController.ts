import {
  removeUserFromChannel,
  renderServerUsersInChannels,
  renderUserToChannel,
} from '../ui-kit/index.ts';

export async function handleSocketMessage(message: any) {
  const data = typeof message === 'string' ? JSON.parse(message) : message;
  console.log('Handling socket message of type:', data.type);
  console.log('Handling socket message of type:', data);
  switch (data.type) {
    case 'user_online':
      console.log('Пользователь онлайн', data);
      break;
    case 'user_offline':
      console.log('Пользователь офлайн', data);
      break;
    case 'user_joined_channel':
      console.log(data);
      renderUserToChannel(
        data.userInfo.channelId,
        data.userInfo.userId,
        data.userInfo.username,
        data.userInfo.userAvatar,
      );
      console.log('Пользователь подключился к каналу', data);
      break;
    case 'user_leave_channel':
      console.log(data);
      removeUserFromChannel(data.userId);
      console.log('Пользователь покинул канал', data);
      break;
    case 'server_users_in_channels':
      renderServerUsersInChannels(data.channelsWithUsers);
      break;
    default:
      console.warn('Неизвестный тип сообщения:', data.type);
  }
}
