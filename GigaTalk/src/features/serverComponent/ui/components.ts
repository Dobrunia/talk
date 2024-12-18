import { serverDATA } from "../../../entities/server/types.ts";
import { renderJoinServerModal } from "../../joinServerModal/model/model.ts";
import { serverClickHandler } from "../model/actions.ts";

export function joinServerElement(): HTMLElement {
  const joinServerDiv = document.createElement('div');
  joinServerDiv.className = 'server_list_element join_server';

  const elementInfo = document.createElement('div');
  elementInfo.className = 'element_info';
  elementInfo.textContent = 'Присоединиться к серверу';

  joinServerDiv.appendChild(elementInfo);
  joinServerDiv.onclick = () => {
    const joinServerModal = document.getElementById('joinServerModal');
    if (joinServerModal) {
      joinServerModal.classList.remove('hidden');
    } else {
      renderJoinServerModal();
    }
  };
  return joinServerDiv;
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
