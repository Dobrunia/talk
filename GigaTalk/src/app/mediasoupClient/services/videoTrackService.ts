import {
  AppData,
  Consumer,
  Producer,
  Transport,
} from 'mediasoup-client/lib/types';
import SVG from '../../ui/svgs.ts';

let videoProducer: Producer | null = null;
let videoStream: MediaStream;

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

export async function createVideoTrack(
  sendTransport: Transport<AppData> | null,
) {
  if (!sendTransport) return;
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    const track = videoStream.getVideoTracks()[0];
    videoProducer = await sendTransport.produce({ track });
    console.log('Video producer created:', videoProducer.id);
  } catch (error) {
    console.log(error);
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

  // Создаем видео элемент
  mediaElement = document.createElement('video');
  mediaElement.classList.add('remoteVideo');
  mediaElement.autoplay = false; // Видео не воспроизводится автоматически
  mediaElement.srcObject = new MediaStream([consumer.track]);

  // Создаем кнопку для воспроизведения видео
  const playButton = document.createElement('button');
  playButton.classList.add('playVideoBtn');
  playButton.textContent = 'Смотреть камеру';

  // Создаем кнопку для паузы просмотра видео
  const pauseButton = document.createElement('button');
  pauseButton.classList.add('pauseVideoBtn', 'hidden');
  pauseButton.textContent = 'прекратить просмотр';

  const fullscreenBtn = document.createElement('button');
  fullscreenBtn.classList.add('fullscreenBtn', 'hidden');
  fullscreenBtn.innerHTML = SVG.fullscreen;

  // Логика воспроизведения видео при нажатии кнопки
  playButton.addEventListener('click', () => {
    toggleCamera(mediaElement, playButton, pauseButton, fullscreenBtn);
  });

  // Логика для паузы просмотра видео при нажатии кнопки
  pauseButton.addEventListener('click', () => {
    toggleCamera(mediaElement, playButton, pauseButton, fullscreenBtn);
  });

  fullscreenBtn.addEventListener('click', () => {
    toggleFullscreen(mediaElement);
  });

  // Добавляем видео и кнопку в контейнер
  videoContainer.appendChild(mediaElement);
  videoContainer.appendChild(playButton);
  videoContainer.appendChild(pauseButton);
  videoContainer.appendChild(fullscreenBtn);

  // Добавляем контейнер в список
  const mediaTracksList = document.getElementById('media_tracks_list');
  if (mediaTracksList) {
    mediaTracksList.appendChild(videoContainer);
  }
}

export function closeVideoProducer() {
  if (videoProducer) {
    videoProducer.close();
    console.log('Video producer closed');
  }

  // Останавливаем треки, связанные с MediaStream
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
    console.log('All media tracks stopped');
  }
}
