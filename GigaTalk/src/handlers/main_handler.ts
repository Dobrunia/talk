import { serverApi } from '../api/serverApi.ts';
import { renderServerInfo } from '../ui-kit/index.ts';

const CACHE_DURATION = 5 * 60 * 1000;
const serverCache = new Map<number, { data: any, timestamp: number }>();

async function serverClickHandler(serverId: number) {
  const cacheEntry = serverCache.get(serverId);
  if (cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION) {
    renderServerInfo(cacheEntry.data);
  } else {
    const serverData = await serverApi.getServerById(serverId);
    serverCache.set(serverId, { data: serverData, timestamp: Date.now() });
    renderServerInfo(serverData);
  }
}

window.serverClickHandler = serverClickHandler;

