import { Device } from 'mediasoup-client';
import { Socket } from 'socket.io-client';
import {
  RtpCapabilities,
  Transport,
  Producer,
  Consumer,
} from 'mediasoup-client/lib/types';
import { emitMediasoupEvent } from '../api/socket/socket.ts';
import {
  createAudioConsumer,
  createAudioTrack,
} from './services/audioTrackService.ts';
import { createVideoConsumer } from './services/videoTrackService.ts';

export const consumers: Consumer[] = []; // Для хранения всех консьюмеров

let device: Device;
let sendTransport: Transport | null;
let recvTransport: Transport | null;

export function getSendTransport(): Transport | null {
  return sendTransport;
}

export async function joinMediasoupRoom(
  socket: Socket,
  roomId: string,
): Promise<void> {
  try {
    await cleanUpTransports(); // Clean up transports to avoid conflicts

    const response = await emitMediasoupEvent(socket, 'joinRoom', { roomId });

    if (response.rtpCapabilities) {
      await initializeDevice(response.rtpCapabilities);
      await createTransport(socket);
      await createAudioTrack(sendTransport);

      socket.emit('mediasoup', {
        type: 'createConsumersForClient',
        payload: { rtpCapabilities: response.rtpCapabilities },
      });

      if (!socket.hasListeners('newConsumer')) {
        socket.on('newConsumer', async (consumerData) => {
          console.log('Handling newConsumer:', consumerData);
          try {
            const consumer = await recvTransport.consume({
              id: consumerData.id,
              producerId: consumerData.producerId,
              kind: consumerData.kind,
              rtpParameters: consumerData.rtpParameters,
            });

            consumers.push(consumer); // Сохраняем consumer
            console.log('New consumer added:', consumer.id);

            if (consumer.kind === 'video') {
              createVideoConsumer(consumer, consumerData.producerUserId);
            } else if (consumer.kind === 'audio') {
              createAudioConsumer(consumer, consumerData.producerUserId);
            }

            await consumer.resume();
            console.log(`Consumer ${consumer.id} created and streaming`);
          } catch (error) {
            console.error('Error creating consumer:', error);
          }
        });
      }
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
    const responseSend = await emitMediasoupEvent(
      socket,
      'createSendTransport',
      {},
    );

    const responseRecv = await emitMediasoupEvent(
      socket,
      'createRecvTransport',
      {},
    );

    if (!responseSend || !responseRecv) {
      // !response.id || !response.iceParameters || !response.dtlsParameters) {
      console.error('Incomplete response received for createTransport');
      return;
    }

    // setInterval(() => {
    //   const networkQuality = Math.random();
    //   if (networkQuality < 0.3) {
    //     updateNetworkIndicator('poor'); // Красный индикатор
    //   } else if (networkQuality < 0.7) {
    //     updateNetworkIndicator('fair'); // Желтый индикатор
    //   } else {
    //     updateNetworkIndicator('bad'); // Зеленый индикатор
    //   }
    // }, 5000);

    // Save the transport and set up event handlers
    if (!sendTransport) {
      sendTransport = device.createSendTransport(responseSend);
      await setupTransportEventHandlers(socket, sendTransport, 'sendTransport');
    }
    if (!recvTransport) {
      recvTransport = device.createRecvTransport(responseRecv);
      await setupTransportEventHandlers(socket, recvTransport, 'recvTransport');
    }
  } catch (error) {
    console.error('Failed to create transport:', error);
  }
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
            socket.emit('mediasoup', {
              type: 'createConsumersForNewProducer',
              payload: {
                producerId: response.id,
                rtpCapabilities: response.rtpCapabilities,
              },
            });
            callback({ id: response.id });
          }
        },
      );
    });
  }
}

function cleanUpTransports() {
  // Очищаем интервал сбора сетевых метрик
  // if (networkStatsIntervalId) {
  //   clearInterval(networkStatsIntervalId);
  //   networkStatsIntervalId = null;
  //   console.log('Network stats interval cleared');
  // }
  // Close the send transport if it's active
  if (sendTransport) {
    sendTransport.removeAllListeners();
    sendTransport.close();
    console.log('sendTransport closed');
  }

  // Close the receive transport if it's active
  if (recvTransport) {
    // Закрываем каждого consumer
    consumers.forEach((consumer) => {
      consumer.close();
      console.log(`Consumer ${consumer.id} closed`);
    });

    consumers.length = 0; // Очищаем массив consumers

    recvTransport.removeAllListeners();
    recvTransport.close();
    console.log('recvTransport closed');
  }

  // Nullify the transport objects to avoid accidental reuse
  sendTransport = null;
  recvTransport = null;

  console.log('All transport connections cleaned up');
}
