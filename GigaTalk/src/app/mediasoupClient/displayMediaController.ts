import { Transport, Producer } from 'mediasoup-client/lib/types';

let screenProducer: Producer | null = null;
let audioProducer: Producer | null = null;
let mediaRecorder: MediaRecorder | null = null; // Для записи
let recordedChunks: Blob[] = []; // Для хранения данных записи

/**
 * Начинает трансляцию экрана со звуком системы и запись.
 * @param sendTransport - Transport для отправки медиапотока.
 */
export async function startScreenShare(sendTransport: Transport) {
  try {
    // Запрашиваем доступ к экрану и системному звуку
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop', // Для Chrome (захват системного звука)
        },
      } as any, // Приведение для работы в TypeScript
    });

    // Получаем трек видео (экран)
    const screenTrack = stream.getVideoTracks()[0];
    screenProducer = await sendTransport.produce({
      track: screenTrack,
    });

    console.log('Screen sharing started:', screenProducer.id);

    // Проверяем, доступен ли системный звук
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      const audioTrack = audioTracks[0];
      audioProducer = await sendTransport.produce({
        track: audioTrack,
      });

      console.log('System audio sharing started:', audioProducer.id);
    }

    // **Запуск записи**
    startRecording(stream);

    // Обрабатываем завершение захвата экрана
    screenTrack.addEventListener('ended', () => {
      stopScreenShare();
    });
  } catch (error) {
    console.error('Error starting screen share:', error);
  }
}

/**
 * Завершает трансляцию экрана, системного звука и запись.
 */
export function stopScreenShare() {
  try {
    if (screenProducer) {
      screenProducer.close();
      console.log('Screen sharing stopped');
      screenProducer = null;
    }

    if (audioProducer) {
      audioProducer.close();
      console.log('System audio sharing stopped');
      audioProducer = null;
    }

    // **Остановка записи**
    stopRecording();
  } catch (error) {
    console.error('Error stopping screen share:', error);
  }
}

/**
 * Запускает запись видео и звука.
 * @param stream - Поток медиа (видео + аудио).
 */
function startRecording(stream: MediaStream) {
  recordedChunks = []; // Очищаем предыдущие записи

  // Создаём MediaRecorder для записи
  mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm; codecs=vp9', // Выбираем формат записи
  });

  // Обрабатываем данные при доступности
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  // Обрабатываем завершение записи
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);

    // Создаём ссылку для скачивания
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `screen_recording_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    console.log('Recording saved.');
  };

  // Запуск записи
  mediaRecorder.start();
  console.log('Recording started.');
}

/**
 * Останавливает запись видео и звука.
 */
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    console.log('Recording stopped.');
    mediaRecorder = null;
  }
}

// Начать трансляцию экрана
// document.getElementById('startScreenShareBtn').addEventListener('click', () => {
//     startScreenShare(sendTransport);
//   });

//   // Остановить трансляцию экрана
//   document.getElementById('stopScreenShareBtn').addEventListener('click', () => {
//     stopScreenShare();
//   });
