import { serverDATA } from '../types.ts';

type ServerState = {
  servers: serverDATA[]; // Список всех серверов пользователя
  currentServer: serverDATA | null; // Текущий выбранный сервер
};

const serverStore = (() => {
  let state: ServerState = {
    servers: [],
    currentServer: null,
  };

  const listeners: Array<(state: ServerState) => void> = [];

  return {
    getState() {
      return state;
    },
    setState(newState: Partial<ServerState>) {
      state = { ...state, ...newState };
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener: (state: ServerState) => void) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      };
    },
  };
})();

export default serverStore;
