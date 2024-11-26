import { getUserId } from '../../../entities/user/model/selectors.ts';
import { userInChannel } from '../ui/UserInChannel.ts';

export function renderUserToChannel(
  channelId: string,
  userId: string,
  username: string,
  userAvatar: string,
) {
  const user_list = document.getElementById(`user_list_${channelId}`);
  if (user_list) {
    user_list.appendChild(userInChannel(userId, username, userAvatar));
  }
}

export function removeUserFromChannel(userId: string) {
  userId = userId.toString();
  document.getElementById(`user_in_channel_${userId}`)?.remove();
  const myId = getUserId();
  if (myId !== userId) {
    Array.from(document.getElementsByClassName(`mediaEl_${userId}`)).forEach(
      (element) => {
        element.remove();
      },
    );
  } else {
    Array.from(document.getElementsByClassName(`mediaEl`)).forEach(
      (element) => {
        element.remove();
      },
    );
  }
}

export function renderServerUsersInChannels(channelsWithUsers: any) {
  console.log(channelsWithUsers);

  for (const channelId in channelsWithUsers) {
    const users = channelsWithUsers[channelId];

    users.forEach((user: any) => {
      renderUserToChannel(
        channelId,
        user.userId,
        user.username,
        user.userAvatar,
      );
      console.log('Отрисовали', user.username, 'в канале', channelId);
    });
  }
}
