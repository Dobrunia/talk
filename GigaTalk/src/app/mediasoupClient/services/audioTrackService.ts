import { AppData, Consumer, Producer, Transport } from 'mediasoup-client/lib/types';
import { getUserId } from '../../../entities/user/model/selectors.ts';

let audioProducer: Producer | null = null;

export function getAudioProducer(): Producer | null {
  return audioProducer;
}

export async function createAudioTrack(
  sendTransport: Transport<AppData> | null,
) {
  if (!sendTransport) return;
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true, // Подавление эха
      noiseSuppression: true, // Подавление шума
    },
  });
  const track = mediaStream.getAudioTracks()[0];
  audioProducer = await sendTransport.produce({ track });
  // Подключаем анализатор громкости
  createVolumeAnalyser(track, getUserId() as string);
  console.log('Audio producer created:', audioProducer.id);
}

export function createAudioConsumer(consumer: Consumer<AppData>, producerUserId: string) {
  let mediaElement: HTMLAudioElement;
  mediaElement = document.createElement('audio');
  mediaElement.classList.add(
    'remoteAudio',
    'mediaEl',
    `mediaEl_${producerUserId}`,
  );
  mediaElement.autoplay = true;
  mediaElement.srcObject = new MediaStream([consumer.track]);

  // Подключаем анализатор громкости
  createVolumeAnalyser(consumer.track, producerUserId);

  // Добавляем аудио в список
  const mediaTracksList = document.getElementById('media_tracks_list');
  if (mediaTracksList) {
    mediaTracksList.appendChild(mediaElement);
  }
}

function createVolumeAnalyser(track: MediaStreamTrack, userId: string) {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(new MediaStream([track]));

  source.connect(analyser);

  analyser.fftSize = 256;
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function checkVolume() {
    analyser.getByteFrequencyData(dataArray);
    const maxVolume = Math.max(...dataArray);

    if (maxVolume > 50) {
      // Условие для определения, что пользователь говорит
      const usr = document.getElementById(`user_in_channel_${userId}`);
      if (!usr) return;
      usr.classList.add('speaking'); // Подсвечиваем
    } else {
      const usr = document.getElementById(`user_in_channel_${userId}`);
      if (!usr) return;
      usr.classList.remove('speaking'); // Убираем подсветку
    }

    requestAnimationFrame(checkVolume);
  }

  checkVolume();
}
