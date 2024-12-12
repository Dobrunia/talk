import { AppData, Consumer } from 'mediasoup-client/lib/types';
import SVG from '../../../app/ui/svgs.ts';
import {
  pauseVideoConsumer,
  resumeVideoConsumer,
} from '../model/videoActions.ts';

function toggleCamera(
  mediaElement: HTMLVideoElement,
  playButton: HTMLButtonElement,
  pauseButton: HTMLButtonElement,
  fullscreenBtn: HTMLButtonElement,
) {
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

function showCamera(
  playButton: HTMLButtonElement,
  pauseButton: HTMLButtonElement,
  fullscreenBtn: HTMLButtonElement,
) {
  playButton.classList.add('hidden');
  pauseButton.classList.remove('hidden');
  fullscreenBtn.classList.remove('hidden');
}

function hideCamera(
  playButton: HTMLButtonElement,
  pauseButton: HTMLButtonElement,
  fullscreenBtn: HTMLButtonElement,
) {
  playButton.classList.remove('hidden');
  pauseButton.classList.add('hidden');
  fullscreenBtn.classList.add('hidden');
}

function toggleFullscreen(mediaElement: HTMLVideoElement) {
  if (!document.fullscreenElement) {
    mediaElement.requestFullscreen().catch((err) => {
      console.error(
        `Error attempting to enable fullscreen mode: ${err.message}`,
      );
    });
  } else {
    document.exitFullscreen();
  }
}

export function createVideoConsumer(
  consumer: Consumer<AppData>,
  producerUserId: string,
) {
  let mediaElement: HTMLVideoElement;
  // Создаем контейнер для видео и кнопки
  const videoContainer = document.createElement('div');
  videoContainer.classList.add(
    'videoContainer',
    'mediaEl',
    `mediaEl_${producerUserId}`,
  );

  mediaElement = document.createElement('video');
  mediaElement.classList.add('remoteVideo');
  mediaElement.autoplay = false;
  mediaElement.srcObject = new MediaStream([consumer.track]);

  const playButton = document.createElement('button');
  playButton.classList.add('playVideoBtn');
  playButton.textContent = 'Смотреть камеру';
  playButton.addEventListener('click', () => {
    toggleCamera(mediaElement, playButton, pauseButton, fullscreenBtn);
    resumeVideoConsumer(consumer);
  });

  const pauseButton = document.createElement('button');
  pauseButton.classList.add('pauseVideoBtn', 'hidden');
  pauseButton.textContent = 'прекратить просмотр';
  pauseButton.addEventListener('click', () => {
    toggleCamera(mediaElement, playButton, pauseButton, fullscreenBtn);
    pauseVideoConsumer(consumer);
  });

  const fullscreenBtn = document.createElement('button');
  fullscreenBtn.classList.add('fullscreenBtn', 'hidden');
  fullscreenBtn.innerHTML = SVG.fullscreen;
  fullscreenBtn.addEventListener('click', () => {
    toggleFullscreen(mediaElement);
  });

  videoContainer.appendChild(mediaElement);
  videoContainer.appendChild(playButton);
  videoContainer.appendChild(pauseButton);
  videoContainer.appendChild(fullscreenBtn);

  const mediaTracksList = document.getElementById('consumers_media');
  if (mediaTracksList) {
    mediaTracksList.appendChild(videoContainer);
  }
}

export function createMyVideoElement(track: MediaStreamTrack) {
  let myMediaElement: HTMLVideoElement;
  // Создаем контейнер для видео и кнопки
  const videoContainer = document.createElement('div');
  videoContainer.id = 'myVideoEl';
  videoContainer.classList.add('videoContainer', 'mediaEl');

  myMediaElement = document.createElement('video');
  myMediaElement.classList.add('remoteVideo');
  myMediaElement.autoplay = false;
  myMediaElement.srcObject = new MediaStream([track]);

  const playButton = document.createElement('button');
  playButton.classList.add('playVideoBtn');
  playButton.textContent = 'Смотреть мою камеру';
  playButton.onclick = () => {
    toggleCamera(myMediaElement, playButton, pauseButton, fullscreenBtn);
  };

  const pauseButton = document.createElement('button');
  pauseButton.classList.add('pauseVideoBtn', 'hidden');
  pauseButton.textContent = 'прекратить просмотр';
  pauseButton.onclick = () => {
    toggleCamera(myMediaElement, playButton, pauseButton, fullscreenBtn);
  };

  const fullscreenBtn = document.createElement('button');
  fullscreenBtn.classList.add('fullscreenBtn', 'hidden');
  fullscreenBtn.innerHTML = SVG.fullscreen;
  fullscreenBtn.onclick = () => {
    toggleFullscreen(myMediaElement);
  };

  videoContainer.appendChild(myMediaElement);
  videoContainer.appendChild(playButton);
  videoContainer.appendChild(pauseButton);
  videoContainer.appendChild(fullscreenBtn);

  const mediaTracksList = document.getElementById('myMedia');
  if (mediaTracksList) {
    mediaTracksList.appendChild(videoContainer);
  }
}

export function stopMyVideoPreview() {
  document.getElementById(`myVideoEl`)?.remove();
}