import {
  toggleMicrophoneMute,
  toggleSoundMute,
} from '../../../app/mediasoupClient/muteControls.ts';
import SVG from '../../../app/ui/svgs.ts';
import {
  getAvatar,
  getUsername,
  isMicrophoneMuted,
  isSoundMuted,
} from '../../../entities/user/model/selectors.ts';
import { openProfileModal } from '../model/actions.ts';

function createMyProfile(username: string, userAvatar: string): HTMLElement {
  // Создаем основной контейнер профиля
  const profileContainer = document.createElement('div');

  // Аватар профиля
  const profileAvatar = document.createElement('div');
  profileAvatar.className = 'profile_avatar';
  profileAvatar.style.backgroundImage = `url('${
    userAvatar.startsWith('data:image/') ? userAvatar : '/default_profile.jpg'
  }')`;
  profileAvatar.onclick = openProfileModal; // Добавляем обработчик события
  profileContainer.appendChild(profileAvatar);

  // Имя пользователя
  const profileName = document.createElement('div');
  profileName.className = 'profile_name';
  profileName.textContent = username;
  profileContainer.appendChild(profileName);

  // Кнопки профиля
  const profileButtons = document.createElement('div');
  profileButtons.className = 'profile_buttons';

  // Кнопка микрофона
  const microButton = document.createElement('button');
  microButton.className = 'micro_button';
  microButton.innerHTML = SVG.micro;
  microButton.onclick = () => {
    toggleMicrophoneMute();
    toggleMicVisual();
  };
  profileButtons.appendChild(microButton);

  // Кнопка наушников
  const headphonesButton = document.createElement('button');
  headphonesButton.className = 'headphones_button';
  headphonesButton.innerHTML = SVG.headphones;
  headphonesButton.onclick = () => {
    toggleSoundMute();
    toggleSoundVisual();
  };
  profileButtons.appendChild(headphonesButton);

  profileContainer.appendChild(profileButtons);

  return profileContainer;
}

function renderProfile() {
  const profile = document.getElementById('my_profile');
  if (!profile) {
    console.error('My profile container not found!');
    return;
  }
  const username = getUsername();
  const userAvatar = getAvatar();
  profile.appendChild(
    createMyProfile(username as string, userAvatar as string),
  );
}

function toggleMicVisual() {
  const micButton = document.getElementById('micro');
  if (!micButton) return;
  if (isMicrophoneMuted()) {
    micButton.classList.add('muted');
  } else {
    micButton.classList.remove('muted');
  }
}

function toggleSoundVisual() {
  const soundButton = document.getElementById('headphones');
  if (!soundButton) return;
  if (isSoundMuted()) {
    soundButton.classList.add('muted');
  } else {
    soundButton.classList.remove('muted');
  }
}
