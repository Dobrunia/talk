import { UserStore } from '../types.ts';

// Начальное состояние
const initialState: UserStore = {
  id: null,
  name: null,
  avatar: null,
  currentChannelId: null,
  isMicrophoneMuted: false,
  isSoundMuted: false,
};

// Глобальное состояние пользователя
let userState: UserStore = { ...initialState };

// Подписчики
type Listener = (state: UserStore) => void;
const listeners: Listener[] = [];

// API управления состоянием
export const userStore = {
  // Получить состояние
  getState(): UserStore {
    return { ...userState };
  },

  // Установить состояние
  setState(newState: Partial<UserStore>) {
    userState = { ...userState, ...newState };
    listeners.forEach((listener) => listener(userState));
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
    userState = { ...initialState };
    listeners.forEach((listener) => listener(userState));
  },
};
