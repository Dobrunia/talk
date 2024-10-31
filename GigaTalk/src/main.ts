import {
  serverListElement,
  serverListAddServerElement,
  myProfile,
} from './ui-kit/components';
import './ui-kit/style.css';
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
  
}
renderServersAndAttachListeners(DATA);

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
