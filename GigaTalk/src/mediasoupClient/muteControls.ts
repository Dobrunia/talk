import { getAudioProducer, consumers } from './mediasoupClientSetup';

let audioProducer = getAudioProducer();

// Переменные для отслеживания состояния
let isMicrophoneMuted = false; // Состояние микрофона
let isSoundMuted = false; // Состояние полного мьюта

// Геттеры для получения состояния
export function getMicrophoneMuteState(): boolean {
  return isMicrophoneMuted;
}

export function getSoundMuteState(): boolean {
  return isSoundMuted;
}

// Функция для управления только микрофоном
export function toggleMicrophoneMute(): void {
  // Если полный звук выключен, не разрешаем включать микрофон
  if (isSoundMuted) {
    console.log('Cannot unmute microphone while sound is muted');
    return;
  }

  audioProducer = getAudioProducer(); // Обновляем состояние
  if (audioProducer) {
    if (isMicrophoneMuted) {
      audioProducer.resume();
      console.log('Microphone unmuted');
    } else {
      audioProducer.pause();
      console.log('Microphone muted');
    }
    isMicrophoneMuted = !isMicrophoneMuted;
  } else {
    console.error('Audio producer not available');
  }
}

// Функция для управления мьютом всех звуков (включая микрофон)
export function toggleSoundMute(): void {
  audioProducer = getAudioProducer(); // Обновляем состояние
  if (isSoundMuted) {
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

    isMicrophoneMuted = false; // Сбрасываем состояние микрофона
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

    isMicrophoneMuted = true; // Микрофон всегда отключен при полном мьюте
    console.log('All sounds muted');
  }
  isSoundMuted = !isSoundMuted;
}
