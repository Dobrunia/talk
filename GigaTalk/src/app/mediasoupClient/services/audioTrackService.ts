import {
  AppData,
  Consumer,
  Producer,
  Transport,
} from 'mediasoup-client/lib/types';
import { getUserId } from '../../../entities/user/model/selectors.ts';
import { consumers } from '../mediasoupClientSetup.ts';

let audioProducer: Producer;
let audioStream: MediaStream;
let isMicrophoneMuted: boolean = false; // Статус микрофона
let isSoundMuted: boolean = false; // Статус звука

export function getIsMicrophoneMuted(): boolean {
  return isMicrophoneMuted;
}

export function getIsSoundMuted(): boolean {
  return isSoundMuted;
}

export async function createAudioTrack(
  sendTransport: Transport<AppData> | null,
) {
  if (!sendTransport) return;
  audioStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true, // Подавление эха
      noiseSuppression: true, // Подавление шума
    },
  });
  const track = audioStream.getAudioTracks()[0];
  track.enabled = !isMicrophoneMuted;
  audioProducer = await sendTransport.produce({ track });
  // Если микрофон в муте, приостанавливаем передачу
  if (isMicrophoneMuted) {
    audioProducer.pause();
    console.log('Audio producer created but muted:', audioProducer.id);
  } else {
    console.log('Audio producer created and active:', audioProducer.id);
  }
  // Подключаем анализатор громкости
  createVolumeAnalyser(track, getUserId() as string);
}

export function createAudioConsumer(
  consumer: Consumer<AppData>,
  producerUserId: string,
): void {
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
  const mediaTracksList = document.getElementById('consumers_media');
  if (mediaTracksList) {
    mediaTracksList.appendChild(mediaElement);
  }
}

function createVolumeAnalyser(track: MediaStreamTrack, userId: string): void {
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

export function toggleMicrophoneMute(): void {
  if (isSoundMuted) return;
  if (isMicrophoneMuted) {
    unmuteMicrophone();
  } else {
    muteMicrophone();
  }
}

function muteMicrophone(): void {
  if (isSoundMuted) return;
  if (!audioStream || !audioProducer) {
    console.error('Audio stream or producer is not initialized');
    return;
  }

  const audioTrack = audioStream.getAudioTracks()[0];

  if (!audioTrack) {
    console.error('No audio track found');
    return;
  }

  // Отключаем трек микрофона
  isMicrophoneMuted = true;
  audioTrack.enabled = false;

  // Приостанавливаем передачу данных через Producer
  if (audioProducer) {
    audioProducer.pause();
  }

  console.log('Microphone muted');
}

function unmuteMicrophone(): void {
  if (isSoundMuted) return;
  if (!audioStream || !audioProducer) {
    console.error('Audio stream or producer is not initialized');
    return;
  }

  const audioTrack = audioStream.getAudioTracks()[0];

  if (!audioTrack) {
    console.error('No audio track found');
    return;
  }

  // Включаем трек микрофона
  isMicrophoneMuted = false;
  audioTrack.enabled = true;

  // Возобновляем передачу данных через Producer
  if (audioProducer) {
    audioProducer.resume();
  }

  console.log('Microphone unmuted');
}

export function toggleSoundMute(): void {
  if (!isSoundMuted) {
    muteMicrophone();
    muteAllSounds();
    console.log('All sounds muted');
  } else {
    unmuteAllSounds();
    console.log('All sounds unmuted');
  }
}

function muteAllSounds(): void {
  isSoundMuted = true;
  // Отключаем все аудиопотоки
  consumers.forEach((consumer) => {
    if (consumer.kind === 'audio') {
      consumer.pause();
      console.log(`Audio consumer ${consumer.id} muted`);
    }
  });
}

function unmuteAllSounds(): void {
  isSoundMuted = false;
  // Включаем все аудиопотоки
  consumers.forEach((consumer) => {
    if (consumer.kind === 'audio') {
      consumer.resume();
      console.log(`Audio consumer ${consumer.id} unmuted`);
    }
  });
}
