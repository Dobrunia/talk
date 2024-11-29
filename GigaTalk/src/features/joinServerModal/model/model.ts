import { serverApi } from '../../../entities/server/api.ts';
import { addServerModal } from '../ui/AddServerModal.ts';

export async function renderAddServerModal() {
  let servers = await serverApi.getAllAvailableServers();
  console.log(servers);
  addServerModal(servers);
}

export function joinServerWithState(serverId: string, button: HTMLButtonElement) {
    // Отключаем кнопку и меняем текст
    button.disabled = true;
    button.textContent = 'Отправлено...';
    button.classList.remove('button-small');
    button.classList.add('button-wait');
  
    // Имитируем отправку данных (заменить на ваш реальный API вызов)
    setTimeout(async () => {
      try {
        joinServer(serverId); // Ваш вызов API или логика присоединения к серверу
        button.textContent = 'Успешно!';
        button.classList.remove('button-wait');
        button.classList.add('button-success'); // Новый класс для успешного состояния
      } catch (error) {
        console.error('Ошибка при присоединении к серверу:', error);
        button.textContent = 'Ошибка!';
        button.classList.remove('button-wait');
        button.classList.add('button-error'); // Новый класс для ошибки
      } finally {
        setTimeout(() => {
          button.disabled = false;
          button.textContent = 'Присоединиться';
          button.classList.remove('button-success', 'button-error');
          button.classList.add('hidden');
        }, 2000); // hidden через 2 секунды
      }
    }, 1000); // Имитация задержки ответа
  }

function joinServer(serverId: string) {
  console.log(`Присоединяемся к серверу с ID: ${serverId}`);
  // Логика присоединения к серверу
}
