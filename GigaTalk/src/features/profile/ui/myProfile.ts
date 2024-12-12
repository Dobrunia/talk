import {
  getIsMicrophoneMuted,
  getIsSoundMuted,
  toggleMicrophoneMute,
  toggleSoundMute,
} from '../../../app/mediasoupClient/services/audioTrackService.ts';
import SVG from '../../../app/ui/svgs.ts';
import {
  getAvatar,
  getUsername,
} from '../../../entities/user/model/selectors.ts';
import { openProfileModal } from '../model/actions.ts';

function createMyProfile(username: string, userAvatar: string): HTMLElement {
  // Создаем основной контейнер профиля
  const profileContainer = document.createElement('div');
  profileContainer.className = 'profile_container';

  // Аватар профиля
  const profileAvatar = document.createElement('div');
  profileAvatar.className = 'profile_avatar';
  profileAvatar.style.backgroundImage = `url('${
    userAvatar ?? '/default_profile.jpg'
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
  microButton.title = 'Отключить микрофон';
  microButton.innerHTML = SVG.micro;
  microButton.onclick = () => {
    toggleMicrophoneMute();
    micVisual();
  };
  profileButtons.appendChild(microButton);

  // Кнопка наушников
  const headphonesButton = document.createElement('button');
  headphonesButton.className = 'headphones_button';
  headphonesButton.title = 'Отключить звук';
  headphonesButton.innerHTML = SVG.headphones;
  headphonesButton.onclick = () => {
    toggleSoundMute();
    soundVisual();
    micVisual();
  };
  profileButtons.appendChild(headphonesButton);

  profileContainer.appendChild(profileButtons);

  return profileContainer;
}

export function renderProfile() {
  const profile = document.getElementById('my_profile');
  if (!profile) {
    console.error('My profile container not found!');
    return;
  }
  profile.innerHTML = ''; // TODO: сделать точечную перерисовку username и userAvatar и микрофоны переработать логику
  const username = getUsername();
  const userAvatar = getAvatar();
  profile.appendChild(
    createMyProfile(username as string, userAvatar as string),
  );
}

function micVisual() {
  const micButtons = document.getElementsByClassName('micro');
  if (!micButtons.length) return;

  Array.from(micButtons).forEach((micButton) => {
    if (getIsMicrophoneMuted()) {
      micButton.classList.add('muted');
    } else {
      micButton.classList.remove('muted');
    }
  });
}

function soundVisual() {
  const soundButtons = document.getElementsByClassName('headphones');
  if (!soundButtons.length) return;

  Array.from(soundButtons).forEach((soundButton) => {
    if (getIsSoundMuted()) {
      soundButton.classList.add('muted');
    } else {
      soundButton.classList.remove('muted');
    }
  });
}
