import { serverDATA } from "../../../entities/server/types.ts";
import { serverClickHandler } from "../model/actions.ts";

export function addServerElement(): HTMLElement {
  const addServerDiv = document.createElement('div');
  addServerDiv.className = 'server_list_element add_server';

  const elementInfo = document.createElement('div');
  elementInfo.className = 'element_info';
  elementInfo.textContent = 'Добавить сервер';

  addServerDiv.appendChild(elementInfo);
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
