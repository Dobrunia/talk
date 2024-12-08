import {
  AppData,
  Consumer,
  Producer,
  Transport,
} from 'mediasoup-client/lib/types';
import { toggleCamera, toggleFullscreen } from '../../../entities/camera/model/actions.ts';
import SVG from '../../ui/svgs.ts';

let videoProducer: Producer | null = null;

export async function createVideoTrack(
  sendTransport: Transport<AppData> | null,
) {
  if (!sendTransport) return;
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    const track = mediaStream.getVideoTracks()[0];
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
    toggleCamera(
      mediaElement as HTMLVideoElement,
      playButton,
      pauseButton,
      fullscreenBtn,
    );
  });

  // Логика для паузы просмотра видео при нажатии кнопки
  pauseButton.addEventListener('click', () => {
    toggleCamera(
      mediaElement as HTMLVideoElement,
      playButton,
      pauseButton,
      fullscreenBtn,
    );
  });

  fullscreenBtn.addEventListener('click', () => {
    toggleFullscreen(mediaElement as HTMLVideoElement);
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
