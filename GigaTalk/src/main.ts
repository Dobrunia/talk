import {
  serverListElement,
  serverListAddServerElement,
  serverName,
  serverCategory,
  myProfile,
} from './ui/components';
import './styles/style.css';
import { serverDATA } from './types/types';

const DATA: serverDATA[] = [
  {
    id: 1,
    imageUrl: '/1.gif',
    serverName: 'Название Сервера 1',
    category: [
      {
        id: 1,
        categoryName: 'первая категория',
        channels: [
          {
            id: 1,
            channelName: 'первый войс канал',
            type: 'voice',
          },
        ],
      },
    ],
  },
];

function addServerClickListener() {
  const servers = document.querySelectorAll('.server_element');
  servers.forEach((server) => {
    server.addEventListener('click', () => {
      const serverId = server.getAttribute('data-id');
      renderServerInfo(DATA);
    });
  });
}

function renderServersAndAttachListeners(DATA: serverDATA[]) {
  const server_list = document.getElementById('servers_list');
  if (!server_list) {
    console.error('Server list container not found!');
    return;
  }
  let htmlContent = serverListAddServerElement();
  DATA.forEach((element) => {
    htmlContent += serverListElement(element);
  });
  server_list.insertAdjacentHTML('beforeend', htmlContent);
  addServerClickListener();
}
renderServersAndAttachListeners(DATA);

function renderServerInfo(DATA: serverDATA[]) {
  let htmlContent = serverName(DATA[0].serverName);
  DATA[0].category?.forEach((element) => {
    htmlContent += serverCategory(element);
  });
  const server_slot = document.getElementById('server_components_block');
  if (!server_slot) {
    console.error('Server info container not found!');
    return;
  }
  server_slot.innerHTML = htmlContent;
}

localStorage.setItem('username', 'Dobrunia');
function m() {
  const profile = document.getElementById('my_profile');
  if (!profile) {
    console.error('My profile container not found!');
    return;
  }
  profile.innerHTML = myProfile();
}
m();
