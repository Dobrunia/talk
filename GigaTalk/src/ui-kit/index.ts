import { serverDATA } from '../types/types.ts';
import {
  serverName,
  serverCategory,
  serverListAddServerElement,
  serverListElement,
  myProfile,
} from '../ui-kit/components.ts';

export function renderServerInfo(serverData: serverDATA) {
  let htmlContent = serverName(serverData.name);
  serverData.categories?.forEach((category) => {
    htmlContent += serverCategory(category);
  });
  const server_slot = document.getElementById('server_components_block');
  if (!server_slot) {
    console.error('Server info container not found!');
    return;
  }
  server_slot.innerHTML = htmlContent;
}

export function renderServersAndAttachListeners(DATA: serverDATA[]) {
  const server_list = document.getElementById('servers_list');
  if (!server_list) {
    console.error('Server list container not found!');
    return;
  }
  let htmlContent = serverListAddServerElement();
  DATA.forEach((server) => {
    htmlContent += serverListElement(server);
  });
  server_list.insertAdjacentHTML('beforeend', htmlContent);
}

export function renderProfile() {
  const profile = document.getElementById('my_profile');
  if (!profile) {
    console.error('My profile container not found!');
    return;
  }
  profile.innerHTML = myProfile();
}
