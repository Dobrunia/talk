import { Device } from 'mediasoup-client';
import {
  Consumer,
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  Transport,
  TransportOptions,
} from 'mediasoup-client/lib/types';
import { sendSocketMessage } from '../socket/socket.ts';

let device: Device | null = null;
let sendTransport: Transport;
let recvTransport: Transport;
const mediaElementsMap = new Map<
  string,
  { consumer: Consumer; mediaElement: HTMLMediaElement }
>();

export async function checkDevice(
  socket: WebSocket,
  sendTransportParams: TransportOptions,
  recvTransportParams: TransportOptions,
) {
  // Если устройство уже загружено, срузу запускаем createTransports
  if (device) {
    await createTransports(socket, sendTransportParams, recvTransportParams);
    return;
  }
  sendSocketMessage({
    type: 'getRouterRtpCapabilities',
  });
}

// Создаем новое устройство mediasoup-client
export async function setDevice(rtpCapabilities: RtpCapabilities) {
  device = new Device();
  console.log('rtpCapabilities ', rtpCapabilities);

  // Загружаем устройство с RTP-способностями роутера
  await device.load({ routerRtpCapabilities: rtpCapabilities });
}

export async function createTransports(
  socket: WebSocket,
  sendTransportParams: TransportOptions,
  recvTransportParams: TransportOptions,
): Promise<void> {
  if (!device) return;
  console.log("Creating sendTransport with params:", sendTransportParams);
  // Создаем sendTransport
  sendTransport = device.createSendTransport(sendTransportParams);
  
  // Обработчики для sendTransport
  sendTransport.on(
    'connect',
    (
      { dtlsParameters }: { dtlsParameters: DtlsParameters },
      callback,
      errback,
    ) => {
      console.log("sendTransport on connect triggered");
      // Сообщаем серверу о готовности установить DTLS-соединение
      sendSocketMessage({
        type: 'connectTransport',
        data: {
          transportId: sendTransport.id,
          dtlsParameters,
        },
      });

      // Ожидаем ответа от сервера для завершения подключения
      socket.addEventListener(
        'message',
        function handleConnectTransport(event) {
          
          const data = JSON.parse(event.data);
          console.log("Received message for connectTransport:", data);
          if (
            data.type === 'connectTransport' &&
            data.transportId === sendTransport.id
          ) {
            if (data.error) {
              errback(new Error(data.error));
            } else {
              callback();
            }
            socket.removeEventListener('message', handleConnectTransport);
          }
        },
      );
    },
  );

  sendTransport.on('produce', (parameters: any, callback, errback) => {
    console.log("sendTransport on produce triggered with parameters:", parameters);
    // Сообщаем серверу о создании нового продюсера
    sendSocketMessage({
      type: 'produce',
      data: {
        transportId: sendTransport.id,
        kind: parameters.kind,
        rtpParameters: parameters.rtpParameters,
      },
    });

    // Ожидаем ответа от сервера с producerId
    socket.addEventListener('message', function handleProduceResponse(event) {
      const data = JSON.parse(event.data);
      console.log("Received message for produce:", data);
      if (data.type === 'produce' && data.transportId === sendTransport.id) {
        if (data.error) {
          errback(new Error(data.error));
        } else {
          callback({ id: data.id });
        }
        socket.removeEventListener('message', handleProduceResponse);
      }
    });
  });

  // Создаем recvTransport
  recvTransport = device.createRecvTransport(recvTransportParams);
  console.log("Creating recvTransport with params:", recvTransportParams);
  // Обработчики для recvTransport
  recvTransport.on(
    'connect',
    (
      { dtlsParameters }: { dtlsParameters: DtlsParameters },
      callback,
      errback,
    ) => {
      console.log("recvTransport on connect triggered");
      // Сообщаем серверу о готовности установить DTLS-соединение
      sendSocketMessage({
        type: 'connectTransport',
        data: {
          transportId: recvTransport.id,
          dtlsParameters,
        },
      });

      // Ожидаем ответа от сервера
      socket.addEventListener(
        'message',
        function handleRecvTransportConnect(event) {
          
          const data = JSON.parse(event.data);
          console.log("Received message for recvTransport connect:", data);
          if (
            data.type === 'connectTransport' &&
            data.transportId === recvTransport.id
          ) {
            if (data.error) {
              errback(new Error(data.error));
            } else {
              callback();
            }
            socket.removeEventListener('message', handleRecvTransportConnect);
          }
        },
      );
    },
  );
    // --- Вызовите produce() для инициирования передачи аудио или видео ---
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = stream.getAudioTracks()[0];
  
      // Вызываем produce для создания аудио Producer
      const audioProducer = await sendTransport.produce({ track: audioTrack });
      console.log("Audio producer created:", audioProducer);
    } catch (error) {
      console.error("Failed to create producer:", error);
    }
}

export function newProducerHandler(socket: WebSocket, producerId: string) {
  if (!device) return;

  // Отправляем серверу запрос на создание Consumer для данного Producer с указанием типа потока
  socket.send(
    JSON.stringify({
      type: 'consume',
      data: {
        producerId,
        rtpCapabilities: device.rtpCapabilities, // Возможности устройства клиента
      },
    }),
  );
}

export async function consumeHandler(
  consumerId: string,
  producerId: string,
  kind: MediaKind,
  rtpParameters: RtpParameters,
) {

  // Создаем Consumer на основе полученных параметров
  const consumer = await recvTransport.consume({
    id: consumerId,
    producerId,
    kind,
    rtpParameters,
  });

  // Воспроизведение медиа-потока
  const mediaStream = new MediaStream([consumer.track]);
  const mediaElement = document.createElement(
    kind === 'audio' ? 'audio' : 'video',
  );
  mediaElement.srcObject = mediaStream;
  mediaElement.autoplay = true;
  mediaElement.controls = true;
  document.body.appendChild(mediaElement);

  // Событие закрытия `Consumer`, когда `Producer` закрывается
  consumer.on('transportclose', () => {
    consumer.close();
    mediaElement.remove();
  });
  // Сохраняйте `consumer` и `mediaElement` после их создания
  mediaElementsMap.set(producerId, { consumer, mediaElement });
  // consumer.on('@producerclose', () => {
  //   console.log(`Producer ${producerId} closed`);
  //   consumer.close();
  //   mediaElement.remove();
  // });
}

// Обработчик закрытия
export function producerClosedHandler(producerId: string) {
  const mediaData = mediaElementsMap.get(producerId);

  if (mediaData) {
    console.log(`Producer ${producerId} closed`);
    mediaData.consumer.close();
    mediaData.mediaElement.remove();

    // Удаляем запись из Map, так как она больше не нужна
    mediaElementsMap.delete(producerId);
  } else {
    console.warn(`No media data found for Producer ${producerId}`);
  }
}
