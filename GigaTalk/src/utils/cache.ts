import { serverDATA } from '../types/types.ts';
import { serverApi } from '../api/serverApi.ts';

export const updateCache = {
  async serversList() {
    try {
      const data = await serverApi.getAllMyServers();
      cacheServersList(data);
    } catch (error) {
      console.error('Failed to update servers list cache:', error);
    }
  },
  async serverInfo(serverId: string) {
    try {
      const data = await serverApi.getMyServerInfoById(serverId);
      cacheServerInfo(serverId, data);
    } catch (error) {
      console.error('Failed to update server cache:', error);
    }
  },
};

async function cacheServersList(data: serverDATA) {
  localStorage.setItem('serversList', JSON.stringify(data));
}

async function cacheServerInfo(serverId: string, data: serverDATA) {
  localStorage.setItem(`server_${serverId}`, JSON.stringify(data));
}

export function saveUserData(
  userId: string,
  username: string,
  userAvatar: string,
) {
  localStorage.setItem('userId', userId.toString());
  localStorage.setItem('username', username);
  localStorage.setItem('userAvatar', userAvatar);
}

export function getData() {
  const userId = localStorage.getItem('userId') || '';
  const username = localStorage.getItem('username') || '';
  const userAvatar = localStorage.getItem('userAvatar') || '';
  const serversList = localStorage.getItem('serversList') || '';
  const DATA = {
    userId,
    username,
    userAvatar,
    serversList: JSON.parse(serversList),
  };
  return DATA;
}
