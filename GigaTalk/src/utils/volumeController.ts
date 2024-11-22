export function createVolumeAnalyser(track: MediaStreamTrack, userId: string) {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(new MediaStream([track]));

  source.connect(analyser);

  analyser.fftSize = 256;
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function checkVolume() {
    analyser.getByteFrequencyData(dataArray);
    const maxVolume = Math.max(...dataArray);

    if (maxVolume > 50) {
      // Условие для определения, что пользователь говорит
      const usr = document.getElementById(`user_in_channel_${userId}`);
      if (!usr) return;
      usr.classList.add('speaking'); // Подсвечиваем
    } else {
      const usr = document.getElementById(`user_in_channel_${userId}`);
      if (!usr) return;
      usr.classList.remove('speaking'); // Убираем подсветку
    }

    requestAnimationFrame(checkVolume);
  }

  checkVolume();
}
