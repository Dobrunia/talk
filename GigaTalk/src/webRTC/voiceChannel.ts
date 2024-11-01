// voiceChannel.ts - Обновленный код для улучшения отладки
let localStream: MediaStream | null = null;
let peerConnection: RTCPeerConnection | null = null;
let isConnected = false;
const pendingCandidates: RTCIceCandidate[] = [];
const activeChannels: Set<number> = new Set();

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your.turn.server:3478',
      username: 'user',
      credential: 'pass',
    },
  ],
};

// Функция для подключения к голосовому каналу
export async function joinVoiceChannel(channelId: number, socket: WebSocket) {
  if (isConnected) {
    console.log(
      'Подключение уже установлено, повторный вызов joinVoiceChannel игнорируется.',
    );
    return;
  }

  try {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    console.log('Local audio stream started.');

    createPeerConnection(socket, channelId);

    localStream.getTracks().forEach((track) => {
      peerConnection?.addTrack(track, localStream);
    });

    const offer = await peerConnection!.createOffer();
    // Получаем SDP строку
    let sdp = offer.sdp;

    // Перемещаем кодек Opus в начало списка, чтобы задать приоритет
    sdp = sdp.replace(/(m=audio.*?)( 0 8 9 )/, '$1 111 0 8 9');

    // Обновляем SDP с новым приоритетом
    offer.sdp = sdp;
    await peerConnection!.setLocalDescription(offer);
    console.log('SDP offer создан:', offer);

    socket.send(JSON.stringify({ type: 'offer', offer, channelId }));
    activeChannels.add(channelId);
    isConnected = true;
  } catch (error) {
    console.error('Ошибка при подключении к голосовому каналу:', error);
  }
}

// Функция для создания RTCPeerConnection
function createPeerConnection(socket: WebSocket, channelId: number) {
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('ICE Candidate найден: ', event.candidate);
      if (peerConnection?.remoteDescription) {
        socket.send(
          JSON.stringify({
            type: 'candidate',
            candidate: event.candidate,
            channelId,
          }),
        );
      } else if (
        !pendingCandidates.some(
          (c) => c.candidate === event.candidate?.candidate,
        )
      ) {
        pendingCandidates.push(event.candidate);
      }
    }
  };

  peerConnection.ontrack = (event) => {
    console.log('Получен удаленный аудиопоток.');
    let remoteAudio = document.getElementById(
      'remoteAudio',
    ) as HTMLAudioElement;
    if (!remoteAudio) {
      console.warn('Элемент remoteAudio не найден, создаем новый элемент.');
      remoteAudio = document.createElement('audio');
      remoteAudio.id = 'remoteAudio';
      remoteAudio.autoplay = true;
      document.body.appendChild(remoteAudio);

      const playButton = document.createElement('button');
      playButton.textContent = 'Нажмите, чтобы включить звук';
      playButton.onclick = () => {
        remoteAudio.play().catch((error) => {
          console.error('Ошибка при воспроизведении удаленного аудио:', error);
        });
      };
      document.body.appendChild(playButton);
    }
    remoteAudio.srcObject = event.streams[0];
  };

  peerConnection.onconnectionstatechange = () => {
    console.log(
      'Состояние соединения изменилось: ',
      peerConnection?.connectionState,
    );
    if (
      peerConnection?.connectionState === 'failed' ||
      peerConnection?.connectionState === 'disconnected'
    ) {
      console.error('Проблемы с соединением, попытка переподключения...');
      leaveVoiceChannel();
      setTimeout(() => joinVoiceChannel(channelId, socket), 3000); // Задержка перед переподключением
    }
  };
}

// Функция для обработки SDP ответа
export async function handleAnswer(answer: RTCSessionDescriptionInit) {
  if (peerConnection) {
    console.log('Получен SDP ответ:', answer);
    try {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
      console.log('Удаленное SDP описание успешно установлено.');
      while (pendingCandidates.length) {
        const candidate = pendingCandidates.shift();
        if (candidate) {
          console.log('Добавляем отложенного ICE кандидата:', candidate);
          await peerConnection.addIceCandidate(candidate);
        }
      }
    } catch (error) {
      console.error('Ошибка при установке удаленного SDP описания:', error);
    }
  } else {
    console.error('peerConnection не существует при обработке SDP ответа.');
  }
}

// Функция для обработки кандидатов
export async function handleCandidate(candidate: RTCIceCandidateInit) {
  if (peerConnection) {
    console.log('Получен ICE кандидат:', candidate);
    try {
      if (peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('ICE кандидат успешно добавлен.');
      } else if (
        !pendingCandidates.some((c) => c.candidate === candidate.candidate)
      ) {
        pendingCandidates.push(new RTCIceCandidate(candidate));
        console.log('ICE кандидат добавлен в очередь.');
      }
    } catch (error) {
      console.error('Ошибка при добавлении ICE кандидата:', error);
    }
  } else {
    console.error('peerConnection не существует при обработке кандидата.');
  }
}

// Функция для обработки SDP предложения
export async function handleOffer(
  offer: RTCSessionDescriptionInit,
  socket: WebSocket,
  channelId: number,
) {
  if (!activeChannels.has(channelId)) {
    console.log(
      'Создаем новое RTCPeerConnection для обработки SDP предложения.',
    );
    createPeerConnection(socket, channelId);
    activeChannels.add(channelId);
  }

  console.log('Устанавливаем удаленное описание для SDP предложения.');
  try {
    await peerConnection!.setRemoteDescription(
      new RTCSessionDescription(offer),
    );
    console.log('Удаленное SDP описание успешно установлено.');
    while (pendingCandidates.length) {
      const candidate = pendingCandidates.shift();
      if (candidate) {
        console.log(
          'Добавляем отложенного ICE кандидата при обработке предложения:',
          candidate,
        );
        await peerConnection!.addIceCandidate(candidate);
      }
    }
  } catch (error) {
    console.error('Ошибка при установке удаленного SDP описания:', error);
  }

  try {
    const answer = await peerConnection!.createAnswer();
    await peerConnection!.setLocalDescription(answer);
    console.log('SDP ответ создан:', answer);
    socket.send(JSON.stringify({ type: 'answer', answer, channelId }));
  } catch (error) {
    console.error('Ошибка при создании или установке SDP ответа:', error);
    return;
  }
}

// Функция для выхода из голосового канала
export function leaveVoiceChannel() {
  console.log('Пользователь покидает голосовой канал.');
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    console.log('Остановлены локальные аудиотреки.');
  } else {
    console.error('localStream не найден при попытке остановить аудиотреки.');
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection.onicecandidate = null;
    peerConnection.ontrack = null;
    peerConnection.onconnectionstatechange = null;
    peerConnection = null;
    console.log('peerConnection закрыт.');
  } else {
    console.error('peerConnection не найден при попытке закрыть соединение.');
  }
  isConnected = false;
  pendingCandidates.length = 0;
  activeChannels.clear();
}
