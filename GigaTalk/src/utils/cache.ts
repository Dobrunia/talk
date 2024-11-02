import { serverDATA } from '../types/types.ts';
import { serverApi } from '../api/serverApi';

export const updateCache = {
  async serversList() {
    try {
      const data = await serverApi.getAllServers();
      cacheServersList(data);
    } catch (error) {
      console.error('Failed to update servers list cache:', error);
    }
  },
  async serverInfo(serverId: number) {
    try {
      const data = await serverApi.getServerById(serverId);
      cacheServerInfo(serverId, data);
    } catch (error) {
      console.error('Failed to update server cache:', error);
    }
  },
};

async function cacheServersList(data: serverDATA) {
  localStorage.setItem('serversList', JSON.stringify(data));
}

async function cacheServerInfo(serverId: number, data: serverDATA) {
  localStorage.setItem(`server_${serverId}`, JSON.stringify(data));
}

export function saveUserData(userId: number, username: string) {
  localStorage.setItem('userId', userId.toString());
  localStorage.setItem('username', username);
}
