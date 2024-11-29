import { serverDATA } from "../../../entities/server/types.ts";
import { renderAddServerModal } from "../../joinServerModal/model/model.ts";
import { serverClickHandler } from "../model/actions.ts";

export function addServerElement(): HTMLElement {
  const addServerDiv = document.createElement('div');
  addServerDiv.className = 'server_list_element add_server';

  const elementInfo = document.createElement('div');
  elementInfo.className = 'element_info';
  elementInfo.textContent = 'Присоединиться к серверу';

  addServerDiv.appendChild(elementInfo);
  addServerDiv.onclick = () => {
    const addServerModal = document.getElementById('addServerModal');
    if (addServerModal) {
      addServerModal.classList.remove('hidden');
    } else {
      renderAddServerModal();
    }
  };
  return addServerDiv;
}

// Создание элемента сервера
export function createServerListElement(server: serverDATA): HTMLElement {
  const serverDiv = document.createElement('div');
  serverDiv.className = 'server_list_element';
  serverDiv.style.backgroundImage = `url(${server.imageUrl})`;
  serverDiv.onclick = () => serverClickHandler(server.id);

  const elementInfo = document.createElement('div');
  elementInfo.className = 'element_info';
  elementInfo.textContent = server.name;

  serverDiv.appendChild(elementInfo);
  return serverDiv;
}
