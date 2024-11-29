import { serverApi } from '../../../entities/server/api.ts';
import { addServer } from '../../../entities/server/model/actions.ts';
import { getAllServers } from '../../../entities/server/model/selectors.ts';
import { addServerModal } from '../ui/AddServerModal.ts';

export async function renderAddServerModal() {
  let servers = await serverApi.getAllAvailableServers();
  console.log(servers);
  addServerModal(servers);
}

export async function joinServerWithState(
  serverId: string,
  button: HTMLButtonElement,
) {
  // Отключаем кнопку и меняем текст
  button.disabled = true;
  button.textContent = 'Отправлено...';
  button.classList.remove('button-small');
  button.classList.add('button-wait');

  try {
    const newServer = await serverApi.joinServer(serverId);
    addServer(newServer);
    button.textContent = 'Успешно!';
    button.classList.remove('button-wait');
    button.classList.add('button-success'); // Класс для успешного состояния
  } catch (error) {
    console.error('Ошибка при присоединении к серверу:', error);
    button.textContent = 'Ошибка!';
    button.classList.remove('button-wait');
    button.classList.add('button-error'); // Класс для ошибки
  } finally {
    // Восстанавливаем состояние кнопки
    button.disabled = false;
    setTimeout(() => {
      button.textContent = 'Присоединиться';
      button.classList.remove('button-success', 'button-error');
      button.classList.add('hidden'); // Скрываем кнопку
    }, 2000); // hidden через 2 секунды
  }
}
