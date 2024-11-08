import { Device } from 'mediasoup-client';
import { Socket } from 'socket.io-client';
import { RtpCapabilities, Transport } from 'mediasoup-client/lib/types';
import { emitMediasoupEvent } from '../socket/socket';

let device: Device;
let sendTransport: Transport;
let recvTransport: Transport;

export async function joinMediasoupRoom(
  socket: Socket,
  roomId: string,
): Promise<void> {
  try {
    const response = await emitMediasoupEvent(socket, 'joinRoom', { roomId });

    if (response.rtpCapabilities) {
      await initializeDevice(response.rtpCapabilities);
      await createTransport(socket);

      socket.emit('mediasoup', {
        type: 'createConsumersForClient',
        payload: { rtpCapabilities: response.rtpCapabilities },
      });

      // Слушаем событие 'newConsumer' для создания consumer на стороне клиента
      socket.on('newConsumer', async (consumerData) => {
        try {
          const consumer = await recvTransport.consume({
            id: consumerData.id,
            producerId: consumerData.producerId,
            kind: consumerData.kind,
            rtpParameters: consumerData.rtpParameters,
          });

          // Обрабатываем медиапоток в зависимости от его типа
          const mediaElement = document.createElement(
            consumer.kind === 'audio' ? 'audio' : 'video',
          );
          mediaElement.srcObject = new MediaStream([consumer.track]);
          mediaElement.autoplay = true;
          //mediaElement.playsInline = true;
          document.body.appendChild(mediaElement);

          // Начинаем воспроизведение потока
          await consumer.resume();
          console.log(
            `Consumer ${consumer.id} успешно создан и воспроизводит поток`,
          );
        } catch (error) {
          console.error('Ошибка при создании consumer:', error);
        }
      });
    }
  } catch (error) {
    console.error('Failed to join room:', error);
  }
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
  try {
    const response = await emitMediasoupEvent(socket, 'createTransport', {});

    if (!response.id || !response.iceParameters || !response.dtlsParameters) {
      console.error('Incomplete response received for createTransport');
      return;
    }

    // Save the transport and set up event handlers
    saveTransport(socket, response);
  } catch (error) {
    console.error('Failed to create transport:', error);
  }
}

async function saveTransport(socket: Socket, response: any) {
  sendTransport = device.createSendTransport(response);
  recvTransport = device.createRecvTransport(response);

  await setupTransportEventHandlers(socket, sendTransport, 'sendTransport');
  await setupTransportEventHandlers(socket, recvTransport, 'recvTransport');
}

async function setupTransportEventHandlers(
  socket: Socket,
  transport: Transport,
  type: string,
) {
  transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
    socket.emit(
      'mediasoup',
      {
        type: 'connectTransport',
        payload: { transportId: transport.id, dtlsParameters },
      },
      (response) => {
        if (!response) {
          console.error('No response received for connectTransport');
          errback('No response received');
          return;
        }

        if (response.error) {
          errback(response.error);
        } else {
          callback();
        }
      },
    );
  });

  if (type === 'sendTransport') {
    transport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
      socket.emit(
        'mediasoup',
        {
          type: 'produce',
          payload: { kind, rtpParameters },
        },
        (response) => {
          if (!response) {
            console.error('No response received for produce');
            errback('No response received');
            return;
          }

          if (response.error) {
            errback(response.error);
          } else {
            callback({ id: response.id });
          }
        },
      );
    });
  }
}
