import serverStore from './store.ts';

// Получить все сервера
export function getAllServers() {
  return serverStore.getState().servers;
}

// Получить текущий выбранный сервер
export function getCurrentServer() {
  return serverStore.getState().currentServer;
}
