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

export function joinRoom(socket: Socket, roomName: string): void {
  socket.emit(
    'mediasoup',
    { type: 'joinRoom', payload: { roomName } },
    async (response: { error?: string; rtpCapabilities?: RtpCapabilities }) => {
      if (response.error) {
        console.error('Failed to join room:', response.error);
        return;
      }

      if (response.rtpCapabilities) {
        await initializeDevice(response.rtpCapabilities);
        await createSendTransport(socket);

        // После создания устройства и транспорта отправки создаем транспорт приема
        await createRecvTransport(socket);

        // После создания recvTransport слушаем новых производителей медиа
        socket.on('newProducer', async (producerId: string) => {
          await consume(socket, producerId);
        });
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

async function createSendTransport(socket: Socket): Promise<void> {
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
      if (response.error) {
        console.error('Failed to create transport:', response.error);
        return;
      }

      sendTransport = device.createSendTransport(response);

      sendTransport.on(
        'connect',
        async (
          { dtlsParameters }: { dtlsParameters: DtlsParameters },
          callback: () => void,
          errback: (error: any) => void,
        ) => {
          socket.emit(
            'mediasoup',
            {
              type: 'connectTransport',
              payload: { transportId: sendTransport.id, dtlsParameters },
            },
            (response: { error?: string }) => {
              if (response.error) {
                errback(response.error);
              } else {
                callback();
              }
            },
          );
        },
      );

      sendTransport.on(
        'produce',
        (
          { kind, rtpParameters }: { kind: string; rtpParameters: any },
          callback: ({ id }: { id: string }) => void,
          errback: (error: any) => void,
        ) => {
          socket.emit(
            'mediasoup',
            {
              type: 'produce',
              payload: { transportId: sendTransport.id, kind, rtpParameters },
            },
            (response: { error?: string; id?: string }) => {
              if (response.error) {
                errback(response.error);
              } else if (response.id) {
                callback({ id: response.id });
              }
            },
          );
        },
      );

      navigator.permissions.query({ name: 'camera' as PermissionName }).then((cameraPermission) => {
        if (cameraPermission.state === 'denied') {
          alert('Camera access is required to participate in this room. Please enable camera permissions.');
          return;
        }
  
        navigator.permissions.query({ name: 'microphone' as PermissionName }).then((micPermission) => {
          if (micPermission.state === 'denied') {
            alert('Microphone access is required to participate in this room. Please enable microphone permissions.');
            return;
          }
  
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
              const videoTrack = stream.getVideoTracks()[0];
              const audioTrack = stream.getAudioTracks()[0];
  
              if (videoTrack) {
                sendTransport.produce({ track: videoTrack }).catch((error) => {
                  console.error('Failed to produce video track:', error);
                });
              }
              if (audioTrack) {
                sendTransport.produce({ track: audioTrack }).catch((error) => {
                  console.error('Failed to produce audio track:', error);
                });
              }
            })
            .catch((error) => {
              console.error('Failed to get user media:', error);
              alert('Please allow access to your camera and microphone to participate in this room.');
            });
        });
      });
    },
  );
}

async function createRecvTransport(socket: Socket): Promise<void> {
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
      if (response.error) {
        console.error('Failed to create transport:', response.error);
        return;
      }

      recvTransport = device.createRecvTransport(response);

      recvTransport.on(
        'connect',
        (
          { dtlsParameters }: { dtlsParameters: DtlsParameters },
          callback: () => void,
          errback: (error: any) => void,
        ) => {
          socket.emit(
            'mediasoup',
            {
              type: 'connectTransport',
              payload: { transportId: recvTransport.id, dtlsParameters },
            },
            (response: { error?: string }) => {
              if (response.error) {
                errback(response.error);
              } else {
                callback();
              }
            },
          );
        },
      );
    },
  );
}

async function consume(socket: Socket, producerId: string): Promise<void> {
  socket.emit(
    'mediasoup',
    {
      type: 'consume',
      payload: { producerId, rtpCapabilities: device.rtpCapabilities },
    },
    (response: {
      error?: string;
      id: string;
      kind: 'video' | 'audio';
      rtpParameters: any;
    }) => {
      if (response.error) {
        console.error('Failed to consume:', response.error);
        return;
      }

      const { id, kind, rtpParameters } = response;
      recvTransport
        .consume({ id, producerId, kind, rtpParameters })
        .then(async (consumer) => {
          const stream = new MediaStream();
          await stream.addTrack(consumer.track);

          if (kind === 'video') {
            const videoElement = document.getElementById(
              'remoteVideo',
            ) as HTMLVideoElement;
            videoElement.srcObject = stream;
            videoElement.play();
          } else if (kind === 'audio') {
            const audioElement = document.getElementById(
              'remoteAudio',
            ) as HTMLAudioElement;
            audioElement.srcObject = stream;
            audioElement.play();
          }
        })
        .catch((error) => {
          console.error('Failed to consume:', error);
        });
    },
  );
}

// Пример использования consume после создания recvTransport
// createRecvTransport(socket).then(() => consume(socket, 'producerId'));
