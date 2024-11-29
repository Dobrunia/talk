import { serverApi } from '../../../entities/server/api.ts';
import { addServerModal } from '../ui/AddServerModal.ts';

export async function renderAddServerModal() {
  let servers = await serverApi.getAllAvailableServers();
  console.log(servers);
  addServerModal(servers);
}

export function joinServer(serverId: string) {
  console.log(`Присоединяемся к серверу с ID: ${serverId}`);
  // Логика присоединения к серверу
}
