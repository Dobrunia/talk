import { serverDATA } from '../types/types.ts';
import { renderProfile, renderServersList, renderSettings } from '../ui-kit/index.ts';
import { updateCache } from './cache.ts';

async function loadServers() {
  const cachedServers = localStorage.getItem('serversList');
  let serversList: serverDATA[] = [];
  console.log('loadServers');

  if (cachedServers) {
    try {
      console.log('loadServers cached');
      serversList = JSON.parse(cachedServers) as serverDATA[];
      renderServersList(serversList);
    } catch (error) {
      console.error('Failed to parse cached servers list:', error);
    }
  }

  if (serversList.length === 0) {
    await updateCache.serversList();
    const updatedServersList = localStorage.getItem('serversList');
    console.log('loadServers api');

    if (updatedServersList) {
      serversList = JSON.parse(updatedServersList) as serverDATA[];
      renderServersList(serversList);
    }
  }
}

export function logInRender() {
  renderProfile();
  loadServers();
  renderSettings();
}
