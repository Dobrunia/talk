export function toggleCamera(
  mediaElement: HTMLVideoElement,
  playButton: HTMLButtonElement,
  pauseButton: HTMLButtonElement,
  fullscreenBtn: HTMLButtonElement,
) {
  if (mediaElement.paused) {
    // Если видео на паузе, запускаем его и скрываем кнопку
    mediaElement.play();
    showCamera(playButton, pauseButton, fullscreenBtn);
  } else {
    // Если видео воспроизводится, ставим его на паузу и показываем кнопку
    mediaElement.pause();
    hideCamera(playButton, pauseButton, fullscreenBtn);
  }
}

function showCamera(
  playButton: HTMLButtonElement,
  pauseButton: HTMLButtonElement,
  fullscreenBtn: HTMLButtonElement,
) {
  playButton.classList.add('hidden');
  pauseButton.classList.remove('hidden');
  fullscreenBtn.classList.remove('hidden');
}

function hideCamera(
  playButton: HTMLButtonElement,
  pauseButton: HTMLButtonElement,
  fullscreenBtn: HTMLButtonElement,
) {
  playButton.classList.remove('hidden');
  pauseButton.classList.add('hidden');
  fullscreenBtn.classList.add('hidden');
}

export function toggleFullscreen(mediaElement: HTMLVideoElement) {
  if (!document.fullscreenElement) {
    mediaElement.requestFullscreen().catch((err) => {
      console.error(
        `Error attempting to enable fullscreen mode: ${err.message}`,
      );
    });
  } else {
    document.exitFullscreen();
  }
}
