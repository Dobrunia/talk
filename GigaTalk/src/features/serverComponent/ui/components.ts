import { serverDATA } from "../../../entities/server/types.ts";
import { renderCreateServerModal } from "../../createServerModal/model/model.ts";
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

export function createMyServerElement(): HTMLElement {
  const createServerDiv = document.createElement('div');
  createServerDiv.className = 'server_list_element create_server';

  const elementInfo = document.createElement('div');
  elementInfo.className = 'element_info';
  elementInfo.textContent = 'Создать свой сервер';

  createServerDiv.appendChild(elementInfo);
  createServerDiv.onclick = renderCreateServerModal;
  return createServerDiv;
}

// Создание элемента сервера
export function createServerListElement(server: serverDATA): HTMLElement {
  const serverDiv = document.createElement('div');
  serverDiv.className = 'server_list_element';
  serverDiv.style.backgroundImage = server.imageUrl ? `url(${server.imageUrl})` : `url(./question-mark.svg`;
  serverDiv.onclick = () => {
    serverClickHandler(server.id);
    const elements = document.querySelectorAll('.current_server_element');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove('current_server_element');
    }
    serverDiv.classList.add('current_server_element');
  };

  const elementInfo = document.createElement('div');
  elementInfo.className = 'element_info';
  elementInfo.textContent = server.name;

  serverDiv.appendChild(elementInfo);
  return serverDiv;
}
