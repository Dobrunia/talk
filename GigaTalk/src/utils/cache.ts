import { serverDATA } from '../types/types.ts';
import {
  renderServerInfo,
  renderServersAndAttachListeners,
} from '../ui-kit/index.ts';
import {
  updateServerCacheInfo,
  updateServersListCache,
} from '../utils/updateInfo.ts';

export async function serverClickHandler(serverId: number) {
  const cachedServerData = localStorage.getItem(`server_${serverId}`);
  let serverData: serverDATA | null = null;
  console.log('serverClickHandler');

  if (cachedServerData) {
    try {
      console.log('Отрисовываем сервер из кэша');
      serverData = JSON.parse(cachedServerData) as serverDATA;
      renderServerInfo(serverData);
    } catch (error) {
      console.error('Failed to parse cached serverData:', error);
    }
  }

  if (!serverData) {
    await updateServerCacheInfo(serverId);
    const updatedServerData = localStorage.getItem(`server_${serverId}`);
    if (updatedServerData) {
      serverData = JSON.parse(updatedServerData) as serverDATA;
      renderServerInfo(serverData);
      console.log('Отрисовываем обновлённые данные сервера');
    }
  }
}

export async function loadServers() {
  const cachedServers = localStorage.getItem('serversList');
  let serversList: serverDATA[] = [];
  console.log('loadServers');

  if (cachedServers) {
    try {
      console.log('loadServers cached');
      serversList = JSON.parse(cachedServers) as serverDATA[];
      renderServersAndAttachListeners(serversList);
    } catch (error) {
      console.error('Failed to parse cached servers list:', error);
    }
  }

  if (serversList.length === 0) {
    await updateServersListCache();
    const updatedServersList = localStorage.getItem('serversList');
    console.log('loadServers api');

    if (updatedServersList) {
      serversList = JSON.parse(updatedServersList) as serverDATA[];
      renderServersAndAttachListeners(serversList);
    }
  }
}
