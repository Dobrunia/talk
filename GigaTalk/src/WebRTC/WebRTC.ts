import { sendSocketMessage } from '../socket/socket.ts';

let peerConnection: RTCPeerConnection;
let localStream: MediaStream | null = null;

// Конфигурация для STUN-сервера (добавьте TURN-сервер для более надежного соединения)
const configuration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

// Функция для начала звонка
export async function startCall(serverId: string, channelId: string) {
  if (!peerConnection || peerConnection.signalingState === 'closed') {
    peerConnection = createPeerConnection(serverId, channelId);
  }

  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  localStream
    .getTracks()
    .forEach((track) =>
      peerConnection.addTrack(track, localStream as MediaStream),
    );

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  sendSignal('offer', { offer, serverId, channelId });
}

// Создание RTCPeerConnection и установка обработчиков
function createPeerConnection(
  serverId: string,
  channelId: string,
): RTCPeerConnection {
  const pc = new RTCPeerConnection(configuration);

  // Обработка ICE-кандидатов
  pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
      sendSignal('ice-candidate', { candidate, serverId, channelId });
    }
  };

  // Добавление полученных медиапотоков
  pc.ontrack = (event) => {
    const remoteStream = event.streams[0];
    // Здесь вы можете обработать remoteStream и добавить его на страницу для проигрывания
    console.log('ontrack', remoteStream);
    handleRemoteStream(remoteStream);
  };

  return pc;
}

// Обработка поступившего SDP предложения
export async function handleOffer(
  offer: RTCSessionDescriptionInit,
  serverId: string,
  channelId: string,
) {
  if (!peerConnection || peerConnection.signalingState === 'closed') {
    peerConnection = createPeerConnection(serverId, channelId);
  }

  if (peerConnection.signalingState === 'stable') {
    console.warn('Offer received in stable state. Ignoring offer.');
    return;
  }

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  sendSignal('answer', { answer, serverId, channelId });
}

// Обработка поступившего SDP ответа
export async function handleAnswer(answer: RTCSessionDescriptionInit) {
  if (!peerConnection || peerConnection.signalingState !== 'have-local-offer') {
    console.warn('Answer received in wrong state. Ignoring answer.');
    return;
  }
  if (peerConnection) {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
  }
}

// Обработка ICE-кандидатов
export function handleICECandidate(candidate: RTCIceCandidateInit) {
  if (peerConnection) {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch((error) => {
        console.error('Failed to add ICE candidate:', error);
      });
  }
}

// Отправка сигналов через WebSocket
function sendSignal(type: string, payload: any) {
  console.log('sendSignal ', type, payload);
  sendSocketMessage({
    type,
    ...payload,
  });
}

// Обработка удаленного потока (добавьте реализацию для отображения аудио)
function handleRemoteStream(stream: MediaStream) {
  // Вы можете добавить элемент <audio> и присвоить ему srcObject = stream
  const audioElement = document.createElement('audio');
  audioElement.srcObject = stream;
  audioElement.autoplay = true;
  document.body.appendChild(audioElement); // Добавление аудиопотока на страницу
}

// Завершение звонка и очистка
export function endCall() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null as any;
  }
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }
  console.log('Call ended');
}
