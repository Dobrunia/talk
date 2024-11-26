import { Channel, ChannelStoreState } from '../types.ts';

const channelStore = (() => {
  let state: ChannelStoreState = {
    currentChannel: null,
  };

  const listeners: Array<(state: ChannelStoreState) => void> = [];

  return {
    // Получить текущее состояние
    getState() {
      return state;
    },

    // Установить текущее состояние и уведомить подписчиков
    setState(newState: Partial<ChannelStoreState>) {
      state = { ...state, ...newState };
      listeners.forEach((listener) => listener(state));
    },

    // Подписаться на изменения
    subscribe(listener: (state: ChannelStoreState) => void) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },

    // Методы управления текущим каналом
    setCurrentChannel(channel: Channel | null) {
      state.currentChannel = channel;
      this.notify();
    },

    clearCurrentChannel() {
      state.currentChannel = null;
      this.notify();
    },

    notify() {
      listeners.forEach((listener) => listener(state));
    },
  };
})();

export default channelStore;
