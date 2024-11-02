import { serverDATA } from '../types/types.ts';
import {
  serverName,
  serverCategory,
  serverListAddServerElement,
  serverListElement,
  myProfile,
  userInChannel,
} from '../ui-kit/components.ts';

export function renderServerInfo(serverData: serverDATA) {
  let htmlContent = serverName(serverData.name);
  serverData.categories?.forEach((category) => {
    htmlContent += serverCategory(category);
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
  profile.innerHTML = myProfile(username);
}

export function renderUserToChannel(
  channelId: string,
  userId: string,
  username: string,
) {
  const channel_list = document.getElementById(`user_list_${channelId}`);
  if (!channel_list) {
    console.error('User list container not found for channel:', channelId);
    return;
  }
  channel_list.insertAdjacentHTML('beforeend', userInChannel(userId, username));
}

export function removeUserFromChannel(userId: string) {
  const userElement = document.getElementById(`user_in_channel_${userId}`);
  userElement?.remove();
}

export function updateUsersInChannel(
  roomId: string,
  users: { userId: string; username: string }[],
) {
  const [serverId, channelId] = roomId.split('-');
  const channel_list = document.getElementById(`user_list_${channelId}`);
  if (channel_list) {
    channel_list.innerHTML = '';
    users.forEach((user) => {
      renderUserToChannel(channelId, user.userId, user.username);
    });
  }
}
