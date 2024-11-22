import { Device } from 'mediasoup-client';
import { Socket } from 'socket.io-client';
import { RtpCapabilities, Transport } from 'mediasoup-client/lib/types';
import { emitMediasoupEvent } from '../socket/socket';
import { Producer, Consumer } from 'mediasoup-client/lib/types';
import { toggleCamera, toggleFullscreen } from '../ui-kit/index.ts';
import SVG from '../ui-kit/svgs.ts';

let audioProducer: Producer | null = null;
let videoProducer: Producer | null = null;
export const consumers: Consumer[] = []; // Для хранения всех консьюмеров

export function getAudioProducer(): Producer | null {
  return audioProducer;
}

let device: Device;
let sendTransport: Transport | null;
let recvTransport: Transport | null;

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

      await startSendingMedia(socket);
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

            let mediaElement: HTMLVideoElement | HTMLAudioElement;
            if (consumer.kind === 'video') {
              // Создаем контейнер для видео и кнопки
              const videoContainer = document.createElement('div');
              videoContainer.classList.add(
                'videoContainer',
                'mediaEl',
                `mediaEl_${consumerData.producerUserId}`,
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
                toggleCamera(mediaElement as HTMLVideoElement, playButton, pauseButton, fullscreenBtn);
              });

              // Логика для паузы просмотра видео при нажатии кнопки
              pauseButton.addEventListener('click', () => {
                toggleCamera(mediaElement as HTMLVideoElement, playButton, pauseButton, fullscreenBtn);
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
              const mediaTracksList =
                document.getElementById('media_tracks_list');
              if (mediaTracksList) {
                mediaTracksList.appendChild(videoContainer);
              }
            } else if (consumer.kind === 'audio') {
              // Логика для аудио остается неизменной
              mediaElement = document.createElement('audio');
              mediaElement.classList.add(
                'remoteAudio',
                'mediaEl',
                `mediaEl_${consumerData.producerUserId}`,
              );
              mediaElement.autoplay = true;
              mediaElement.srcObject = new MediaStream([consumer.track]);

              // Добавляем аудио в список
              const mediaTracksList =
                document.getElementById('media_tracks_list');
              if (mediaTracksList) {
                mediaTracksList.appendChild(mediaElement);
              }
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

async function startSendingMedia(socket: Socket) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    for (const track of stream.getTracks()) {
      if (track.kind === 'audio') {
        audioProducer = await sendTransport!.produce({ track });
        console.log('Audio producer created:', audioProducer.id);
      } else if (track.kind === 'video') {
        videoProducer = await sendTransport!.produce({ track });
        console.log('Video producer created:', videoProducer.id);
      }
    }

    console.log('Media stream sent');
  } catch (error) {
    console.error('Error sending media:', error);
    alert(
      'Access to camera and microphone denied. Check your browser settings.',
    );
  }
}

function cleanUpTransports() {
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
