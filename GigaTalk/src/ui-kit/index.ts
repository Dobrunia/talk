import {
  getMicrophoneMuteState,
  getSoundMuteState,
} from '../mediasoupClient/muteControls.ts';
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

export function toggleMicVisual() {
  const micButton = document.querySelector('.profile_buttons svg.micro');
  if (!micButton) return;
  let isMicMuted = getMicrophoneMuteState();
  if (isMicMuted) {
    micButton.classList.add('muted');
  } else {
    micButton.classList.remove('muted');
  }
}

export function toggleSoundVisual() {
  const soundButton = document.querySelector('.profile_buttons svg.headphones');
  if (!soundButton) return;
  let isSoundMuted = getSoundMuteState();
  if (isSoundMuted) {
    soundButton.classList.add('muted');
  } else {
    soundButton.classList.remove('muted');
  }
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
  userId = userId.toString();
  document.getElementById(`user_in_channel_${userId}`)?.remove();
  const myId = localStorage.getItem('userId')?.toString();
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

export function renderSettings() {
  const settings = document.getElementById('settings');
  if (!settings) return;
  settings.innerHTML = settingsSvg();
}

export function toggleCamera(mediaElement: HTMLVideoElement, playButton: HTMLButtonElement, pauseButton: HTMLButtonElement, fullscreenBtn: HTMLButtonElement) {
  if (mediaElement.paused) {
    // Если видео на паузе, запускаем его и скрываем кнопку
    mediaElement.play();
    showCamera(playButton, pauseButton, fullscreenBtn);
  } else {
    // Если видео воспроизводится, ставим его на паузу и показываем кнопку
    mediaElement.pause();
    hideCamera(playButton, pauseButton, fullscreenBtn);
  }
}

function showCamera(playButton: HTMLButtonElement, pauseButton: HTMLButtonElement, fullscreenBtn: HTMLButtonElement) {
  playButton.classList.add('hidden');
  pauseButton.classList.remove('hidden');
  fullscreenBtn.classList.remove('hidden');
}

function hideCamera(playButton: HTMLButtonElement, pauseButton: HTMLButtonElement, fullscreenBtn: HTMLButtonElement) {
  playButton.classList.remove('hidden');
  pauseButton.classList.add('hidden');
  fullscreenBtn.classList.add('hidden');
}

export function toggleFullscreen(mediaElement: HTMLVideoElement) {
  if (!document.fullscreenElement) {
    mediaElement.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}