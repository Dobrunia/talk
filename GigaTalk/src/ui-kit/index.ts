import { serverDATA } from '../types/types.ts';
import {
  serverName,
  serverCategory,
  serverListAddServerElement,
  serverListElement,
  myProfile,
  userInChannel,
  serverId,
  settingsSvg,
} from '../ui-kit/components.ts';

export function renderServerInfo(serverData: serverDATA) {
  let htmlContent = serverName(serverData.name);
  htmlContent += serverId(serverData.id.toString());
  serverData.categories?.forEach((category) => {
    htmlContent += serverCategory(category, serverData.id.toString());
  });
  const server_slot = document.getElementById('server_components_block');
  if (!server_slot) {
    console.error('Server info container not found!');
    return;
  }
  server_slot.innerHTML = htmlContent;
}

export function renderServersList(serversList: serverDATA[]) {
  const server_list = document.getElementById('servers_list');
  if (!server_list) {
    console.error('Server list container not found!');
    return;
  }
  let htmlContent = serverListAddServerElement();
  serversList.forEach((server) => {
    htmlContent += serverListElement(server);
  });
  server_list.insertAdjacentHTML('beforeend', htmlContent);
}

export function renderProfile() {
  const profile = document.getElementById('my_profile');
  if (!profile) {
    console.error('My profile container not found!');
    return;
  }
  const username = localStorage.getItem('username');
  if (!username) {
    console.error('username in localStorage not found!');
    return;
  }
  const userAvatar = localStorage.getItem('userAvatar');
  if (!userAvatar) {
    console.error('userAvatar in localStorage not found!');
    return;
  }
  profile.innerHTML = myProfile(username, userAvatar);
}

export function renderUserToChannel(
  channelId: string,
  userId: string,
  username: string,
  userAvatar: string,
) {
  const user_list = document.getElementById(`user_list_${channelId}`);
  if (user_list) {
    //TODO: null  == undefined
    user_list.insertAdjacentHTML(
      'beforeend',
      userInChannel(userId, username, userAvatar),
    );
  }
}

export function removeUserFromChannel(userId: string) {
  document.getElementById(`user_in_channel_${userId}`)?.remove();
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

export function renderSettings() {
  const settings = document.getElementById('settings');
  if (!settings) return;
  settings.innerHTML = settingsSvg();
}
