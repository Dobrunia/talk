import { sendSocketMessage } from '../../../app/api/socket/socket.ts';
import SVG from '../../../app/ui/svgs.ts';
import { voiceChannelClick } from '../../../entities/channel/model/actions.ts';
import { Channel } from '../../../entities/channel/types.ts';
import { serverApi } from '../../../entities/server/api.ts';
import { Category, serverDATA } from '../../../entities/server/types.ts';
import { addServerElement, createServerListElement } from '../ui/components.ts';

export function renderServerInfo(serverData: serverDATA) {
  const serverSlot = document.getElementById('server_components_block');
  if (!serverSlot) {
    console.error('Server info container not found!');
    return;
  }

  // Очищаем контейнер перед рендерингом
  serverSlot.innerHTML = '';

  // Создаем и добавляем название сервера
  const serverNameElement = document.createElement('h1');
  serverNameElement.textContent = serverData.name;
  serverNameElement.className = 'server_name';
  serverSlot.appendChild(serverNameElement);

  // Рендеринг категорий
  serverData.categories?.forEach((category) => {
    const categoryElement = createServerCategory(category);
    serverSlot.appendChild(categoryElement);
  });
}

function createServerCategory(category: Category): HTMLElement {
  const categoryElement = document.createElement('div');
  categoryElement.className = 'server_category';

  const categoryHeader = document.createElement('div');
  categoryHeader.className = 'category_header';

  const categoryName = document.createElement('span');
  categoryName.textContent = category.name;

  const toggleIcon = document.createElement('span');
  toggleIcon.textContent = '-';
  toggleIcon.className = 'toggle_icon';

  categoryHeader.appendChild(categoryName);
  categoryHeader.appendChild(toggleIcon);

  const channelList = document.createElement('ul');
  channelList.className = 'channel_list';

  categoryHeader.onclick = () => toggleCategory(channelList, toggleIcon);
  categoryElement.appendChild(categoryHeader);

  category.channels?.forEach((channel) => {
    const channelItem = createChannelItem(channel);
    channelList.appendChild(channelItem);
  });

  categoryElement.appendChild(channelList);

  return categoryElement;
}

function toggleCategory(
  channelList: HTMLUListElement,
  toggleIcon: HTMLSpanElement,
) {
  if (
    channelList.style.display === 'none' ||
    channelList.style.display === ''
  ) {
    channelList.style.display = 'block';
    toggleIcon.textContent = '-';
  } else {
    channelList.style.display = 'none';
    toggleIcon.textContent = '+';
  }
}

function createChannelItem(channel: Channel): HTMLElement {
  const channelItem = document.createElement('li');
  channelItem.className = 'channel_item';

  const channelName = document.createElement('div');
  channelName.className = 'channel_name';
  channelName.onclick = () => voiceChannelClick(channel.id);

  const channelIcon = document.createElement('div');
  channelIcon.innerHTML = channel.type === 'voice' ? SVG.voiceIco : '#';

  const channelText = document.createElement('div');
  channelText.textContent = channel.name;

  channelName.appendChild(channelIcon);
  channelName.appendChild(channelText);

  channelItem.appendChild(channelName);

  const userList = document.createElement('ul');
  userList.className = 'user_list';
  userList.id = `user_list_${channel.id}`;
  channelItem.appendChild(userList);

  return channelItem;
}

// Отрисовка списка серверов
export function renderServersList(serversList: serverDATA[]): void {
  const serverListContainer = document.getElementById('servers_list');
  if (!serverListContainer) {
    console.error('Server list container not found!');
    return;
  }

  // Очистка предыдущего содержимого
  serverListContainer.innerHTML = '';

  // Добавление кнопки "Добавить сервер"
  serverListContainer.appendChild(addServerElement());

  // Добавление серверов
  serversList.forEach((server) => {
    const serverElement = createServerListElement(server);
    serverListContainer.appendChild(serverElement);
  });
}

export async function serverClickHandler(serverId: string) {
  const updatedServerData = await serverApi.getMyServerInfoById(serverId);
  if (updatedServerData) {
    const serverData = JSON.parse(updatedServerData) as serverDATA;
    renderServerInfo(serverData);
    console.log('Отрисовка данных сервера');
    sendSocketMessage({
      type: 'user_opened_server',
      serverId,
    });
    console.log('Отрисовали активных пользователей сервера');
  } else {
    console.error('Failed to load server info');
  }
}
