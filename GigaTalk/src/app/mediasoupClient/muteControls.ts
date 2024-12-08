import {
  muteMicrophone,
  toggleMicrophone,
  toggleSound,
  unmuteMicrophone,
} from '../../entities/user/model/actions.ts';
import {
  isMicrophoneMuted,
  isSoundMuted,
} from '../../entities/user/model/selectors.ts';
import { consumers } from './mediasoupClientSetup.ts';
import { getAudioProducer } from './services/audioTrackService.ts';

let audioProducer = getAudioProducer();

export function toggleMicrophoneMute(): void {
  // Если полный звук выключен, не разрешаем включать микрофон
  if (isSoundMuted()) {
    console.log('Cannot unmute microphone while sound is muted');
    return;
  }

  audioProducer = getAudioProducer(); // Обновляем состояние
  if (audioProducer) {
    if (isMicrophoneMuted()) {
      audioProducer.resume();
      console.log('Microphone unmuted');
    } else {
      audioProducer.pause();
      console.log('Microphone muted');
    }
  } else {
    console.error('Audio producer not available');
  }
  toggleMicrophone();
}

export function toggleSoundMute(): void {
  audioProducer = getAudioProducer(); // Обновляем состояние
  if (isSoundMuted()) {
    // Включаем всех (видео остается активным)
    consumers.forEach((consumer) => {
      if (consumer.kind === 'audio') {
        consumer.resume();
        console.log(`Audio consumer ${consumer.id} unmuted`);
      }
    });

    // Если микрофон был отключен этой кнопкой, включаем его
    if (audioProducer) {
      audioProducer.resume();
      console.log('Microphone unmuted');
    }

    //unmuteMicrophone(); // Сбрасываем состояние микрофона
    console.log('All sounds unmuted');
  } else {
    // Выключаем всех (видео остается активным)
    consumers.forEach((consumer) => {
      if (consumer.kind === 'audio') {
        consumer.pause();
        console.log(`Audio consumer ${consumer.id} muted`);
      }
    });

    // Выключаем микрофон
    if (audioProducer) {
      audioProducer.pause();
      console.log('Microphone muted');
    }

    muteMicrophone(); // Микрофон всегда отключен при полном мьюте
    console.log('All sounds muted');
  }
  toggleSound();
}
