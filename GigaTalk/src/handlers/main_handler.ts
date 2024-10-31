import { serverApi } from '../api/serverApi.ts';
import { renderServerInfo } from '../ui-kit/index.ts';

async function serverClickHandler(serverId: number) {
  const serverData = await serverApi.getServerById(serverId);
  renderServerInfo(serverData);
}
window.serverClickHandler = serverClickHandler;
