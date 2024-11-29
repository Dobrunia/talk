import { serverDATA } from '../../../entities/server/types.ts';
import { joinServerWithState } from '../model/model.ts';

export function addServerModal(servers: serverDATA[]) {
  const modal = document.createElement('div');
  modal.id = 'addServerModal';
  modal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  // Заголовок модального окна
  const header = document.createElement('h2');
  header.textContent = 'Добавить сервер';
  header.className = 'modal-header';
  modalContent.appendChild(header);

  // Поле для поиска
  const searchContainer = document.createElement('div');
  searchContainer.className = 'modal-container';

  const searchLabel = document.createElement('label');
  searchLabel.textContent = 'Поиск серверов:';
  searchLabel.className = 'modal-label';
  searchContainer.appendChild(searchLabel);

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'modal-input';
  searchInput.placeholder = 'Введите название сервера';
  searchContainer.appendChild(searchInput);

  modalContent.appendChild(searchContainer);

  // Контейнер для списка серверов
  const serverListContainer = document.createElement('div');
  serverListContainer.id = 'serverListContainer';
  serverListContainer.className = 'modal-container';

  servers.forEach((server) => {
    const serverElement = document.createElement('div');
    serverElement.className = 'server-item';

    const serverName = document.createElement('div');
    serverName.className = 'server-name';
    serverName.textContent = server.name;
    serverName.title = server.name; // Полный текст при наведении

    const joinButton = document.createElement('button');
    joinButton.textContent = 'Присоединиться';
    joinButton.className = 'button-small';
    joinButton.addEventListener('click', () => joinServerWithState(server.id, joinButton));

    serverElement.appendChild(serverName);
    serverElement.appendChild(joinButton);
    serverListContainer.appendChild(serverElement);
  });

  modalContent.appendChild(serverListContainer);

  // Кнопка закрытия
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Закрыть';
  closeButton.className = 'button button-secondary';
  closeButton.addEventListener('click', () => modal.classList.add('hidden'));

  modalContent.appendChild(closeButton);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Обработчик для поиска
  searchInput.addEventListener('input', () => {
    const searchValue = searchInput.value.toLowerCase();
    const allServers = serverListContainer.querySelectorAll('.server-item');
    allServers.forEach((serverElement) => {
      const element = serverElement as HTMLElement;
      const serverName =
        element.querySelector('.server-name')?.textContent?.toLowerCase() ?? '';
      element.style.display = serverName.includes(searchValue)
        ? 'flex'
        : 'none';
    });
  });
}
