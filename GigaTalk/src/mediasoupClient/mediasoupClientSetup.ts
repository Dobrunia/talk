import { Device } from 'mediasoup-client';
import { Socket } from 'socket.io-client';
import {
  RtpCapabilities,
  Transport,
  DtlsParameters,
} from 'mediasoup-client/lib/types';

let device: Device;
let sendTransport: Transport;
let recvTransport: Transport;

export function joinMediasoupRoom(socket: Socket, roomId: string): void {
  socket.emit(
    'mediasoup',
    { type: 'joinRoom', payload: { roomId } },
    async (response: { error?: string; rtpCapabilities?: RtpCapabilities }) => {
      if (response.error) {
        console.error('Failed to join room:', response.error);
        return;
      }

      if (response.rtpCapabilities) {
        await initializeDevice(response.rtpCapabilities);
        await createTransport(socket);
        // После создания Transport слушаем новых производителей медиа

        // socket.on('newProducer', async (producerId: string) => {
        //   await consume(socket, producerId);
        // });
      }
    },
  );
}

async function initializeDevice(
  rtpCapabilities: RtpCapabilities,
): Promise<void> {
  try {
    device = new Device();
    await device.load({ routerRtpCapabilities: rtpCapabilities });
    console.log('Device initialized');
  } catch (error) {
    console.error('Failed to initialize device:', error);
  }
}

async function createTransport(socket: Socket): Promise<void> {
  // Добавьте логирование перед отправкой запроса
  console.log('Sending request to createTransport:', {
    type: 'createTransport',
  });

  socket.emit(
    'mediasoup',
    { type: 'createTransport', payload: {} },
    (response: {
      error?: string;
      id: string;
      iceParameters: any;
      iceCandidates: any[];
      dtlsParameters: any;
    }) => {
      console.log('Response from createTransport:', response);
      if (response.error) {
        console.error('Failed to create transport:', response.error);
        return;
      }

      // Проверка, что данные получены правильно
      if (!response.id || !response.iceParameters || !response.dtlsParameters) {
        console.error('Incomplete response received for createTransport');
        return;
      }
      // сохранение транспорта на клиенте
      saveTransport(socket, response);
    },
  );
  // socket.emit('mediasoup', {
  //   type: 'produce',
  //   //какой тут транспорт id на получение?
  //   payload: { transportId: recvTransport.id, kind: 'audio', rtpParameters: },
  // });
  // Получаем доступ к медиастриму (аудио и/или видео)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    const audioTrack = stream.getAudioTracks()[0];

    if (audioTrack) {
      // Вызываем produce() для создания трека
      const producer = await sendTransport.produce({ track: audioTrack });

      // Отправляем rtpParameters на сервер через сокет
      socket.emit('mediasoup', {
        type: 'produce',
        payload: {
          transportId: sendTransport.id, // ID транспорта для отправки
          kind: producer.kind, // 'audio' или 'video'
          rtpParameters: producer.rtpParameters, // Параметры RTP
        },
      });

      console.log(
        'Audio track produced with RTP parameters:',
        producer.rtpParameters,
      );
    }
  } catch (error) {
    console.error('Failed to get user media or produce track:', error);
  }

  socket.on('consume', (data) => {
    consume(socket, data);
  });
}

function saveTransport(socket: Socket, response: any) {
  sendTransport = device.createSendTransport(response);
  recvTransport = device.createRecvTransport(response);
  sendTransport.on(
    'connect',
    ({ dtlsParameters }, callback, errback) => {
      socket.emit(
        'mediasoup',
        {
          type: 'connectTransport',
          payload: { transportId: sendTransport.id, dtlsParameters },
        },
        (response) => {
          if (response.error) {
            errback(response.error);
          } else {
            callback();
          }
        }
      );
    }
  );

  // Добавляем обработчик события 'produce' для sendTransport
  sendTransport.on(
    'produce',
    ({ kind, rtpParameters }, callback, errback) => {
      socket.emit(
        'mediasoup',
        {
          type: 'produce',
          payload: { transportId: sendTransport.id, kind, rtpParameters },
        },
        (response) => {
          if (response.error) {
            errback(response.error);
          } else {
            callback({ id: response.id });
          }
        }
      );
    }
  );
}

export async function consume(socket: Socket, data: any): Promise<void> {
  console.log('Consume event received:', data);

  // Создание `RTCRtpReceiver` и воспроизведение потока
  const consumer = await recvTransport.consume({
    id: data.id,
    producerId: data.producerId,
    kind: data.kind,
    rtpParameters: data.rtpParameters,
  });

  const stream = new MediaStream();
  stream.addTrack(consumer.track);

  // Воспроизведение потока
  const audioElement = document.createElement('audio');
  audioElement.srcObject = stream;
  audioElement.play();

  // Отправка подтверждения на сервер для возобновления потока
  socket.emit('consumer-resume', data.id);
}

// Пример использования consume после создания recvTransport
// createRecvTransport(socket).then(() => consume(socket, 'producerId'));
