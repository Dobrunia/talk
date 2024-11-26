import { serverApi } from '../api.ts';
import { serverDATA } from '../types.ts';
import serverStore from './store.ts';

// Установить список всех серверов
function setAllServers(servers: serverDATA[]) {
  serverStore.setState({ servers });
}

export async function setMyServersList() {
  let serversList: serverDATA[] = await serverApi.getAllMyServers();
  setAllServers(serversList);
}

// Установить текущий выбранный сервер
// function setCurrentServer(server: serverDATA | null) {
//   serverStore.setState({ currentServer: server });
// }

// // Добавить новый сервер
// export function addServer(server: serverDATA) {
//   const currentServers = serverStore.getState().servers;
//   serverStore.setState({ servers: [...currentServers, server] });
// }

// // Обновить сервер по ID
// export function updateServerById(
//   serverId: string,
//   updatedData: Partial<serverDATA>,
// ) {
//   const currentServers = serverStore.getState().servers;
//   const updatedServers = currentServers.map((server) =>
//     server.id === serverId ? { ...server, ...updatedData } : server,
//   );
//   serverStore.setState({ servers: updatedServers });
// }

// // Удалить сервер по ID
// export function removeServerById(serverId: string) {
//   const currentServers = serverStore.getState().servers;
//   const updatedServers = currentServers.filter(
//     (server) => server.id !== serverId,
//   );
//   serverStore.setState({ servers: updatedServers });
// }
