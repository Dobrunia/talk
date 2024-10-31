import { serverApi } from '../api/serverApi.ts';
import { serverDATA } from '../types/types.ts';
import {
  serverName,
  serverCategory,
  serverListAddServerElement,
  serverListElement,
  myProfile,
} from '../ui-kit/components.ts';

export async function renderServerInfo(serverId: number) {
  const DATA: serverDATA[] = [
    {
      id: 1,
      imageUrl: '/1.gif',
      name: 'Название Сервера 1',
      categories: [
        {
          id: 1,
          name: 'первая категория',
          channels: [
            {
              id: 1,
              name: 'первый войс канал',
              type: 'voice',
            },
          ],
        },
        {
          id: 2,
          name: 'вторая категория',
          channels: [
            {
              id: 2,
              name: '2 войс канал',
              type: 'voice',
            },
          ],
        },
      ],
    },
  ];
  await serverApi.getUsers()
  let htmlContent = serverName(DATA[serverId - 1].name);
  DATA[serverId - 1].categories?.forEach((category) => {
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
