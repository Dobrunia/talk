import { serverApi } from '../api/serverApi';

export async function updateServersListCache() {
  try {
    const data = await serverApi.getAllServers();
    localStorage.setItem('serversList', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to update servers list cache:', error);
  }
}

export async function updateServerCacheInfo(serverId: number) {
  try {
    const data = await serverApi.getServerById(serverId);
    localStorage.setItem(`server_${serverId}`, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to update server cache:', error);
  }
}
