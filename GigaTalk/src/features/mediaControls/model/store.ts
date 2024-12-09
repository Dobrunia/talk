import { MediaStoreState } from '../types.ts';

// Начальное состояние
const initialState: MediaStoreState = {
  isCameraOn: false,
  isScreenSharing: false,
};

// Глобальное состояние
let mediaState: MediaStoreState = { ...initialState };

// Подписчики
type Listener = (state: MediaStoreState) => void;
const listeners: Listener[] = [];

// API управления состоянием
export const mediaStore = {
  // Получить состояние
  getState(): MediaStoreState {
    return { ...mediaState };
  },

  // Получить состояние камеры
  getCameraStatus(): boolean {
    return mediaState.isCameraOn;
  },

  // Получить состояние стрима экрана
  getScreenShareStatus(): boolean {
    return mediaState.isScreenSharing;
  },

  // Установить состояние
  setState(newState: Partial<MediaStoreState>) {
    mediaState = { ...mediaState, ...newState };
    listeners.forEach((listener) => listener(mediaState));
  },

  // Подписаться на изменения
  subscribe(listener: Listener) {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  },

  // Сбросить состояние
  resetState() {
    mediaState = { ...initialState };
    listeners.forEach((listener) => listener(mediaState));
  },

  // Переключить состояние камеры
  toggleCamera() {
    mediaState.isCameraOn = !mediaState.isCameraOn;
    listeners.forEach((listener) => listener(mediaState));
  },

  // Переключить состояние стрима экрана
  toggleScreenShare() {
    mediaState.isScreenSharing = !mediaState.isScreenSharing;
    listeners.forEach((listener) => listener(mediaState));
  },
};
