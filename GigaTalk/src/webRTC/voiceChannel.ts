// Объявляем переменные для WebRTC соединения и медиа потока
let localStream: MediaStream | null = null;
let peerConnection: RTCPeerConnection | null = null;
let isConnected = false;

// Конфигурация STUN-сервера для WebRTC
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

// Функция для подключения к голосовому каналу
export async function joinVoiceChannel(channelId: number, socket: WebSocket) {
  if (isConnected) return;

  try {
    // Получаем аудиопоток с микрофона
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Инициализируем WebRTC соединение
    peerConnection = new RTCPeerConnection(configuration);

    // Добавляем аудиопоток в соединение
    localStream.getTracks().forEach((track) => {
      peerConnection?.addTrack(track, localStream!);
    });

    // Отправка ICE-кандидатов через WebSocket
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ type: 'candidate', candidate: event.candidate, channelId }));
      }
    };

    // При получении удаленного потока добавляем его в аудиоплеер
    peerConnection.ontrack = (event) => {
      const remoteAudio = document.getElementById('remoteAudio') as HTMLAudioElement;
      if (remoteAudio) {
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.play();
      }
    };

    // Создание SDP-предложения
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Отправляем SDP-предложение через WebSocket
    socket.send(JSON.stringify({ type: 'offer', offer, channelId }));
    isConnected = true;
  } catch (error) {
    console.error('Ошибка при подключении к голосовому каналу:', error);
  }
}

const candidateQueue: RTCIceCandidateInit[] = []; // Буфер для ICE-кандидатов

// Функция для обработки ответа (answer) на SDP-предложение
export async function handleAnswer(answer: RTCSessionDescriptionInit) {
  if (peerConnection) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

    // После установки RemoteDescription добавляем все ICE-кандидаты из очереди
    while (candidateQueue.length > 0) {
      const candidate = candidateQueue.shift();
      if (candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    }
  }
}

// Обработка ICE-кандидатов
export async function handleCandidate(candidate: RTCIceCandidateInit) {
  if (peerConnection && peerConnection.remoteDescription) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } else {
    // Если RemoteDescription еще не установлено, сохраняем кандидата в буфер
    candidateQueue.push(candidate);
  }
}


// Функция для выхода из голосового канала
export function leaveVoiceChannel() {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  isConnected = false;
}
