import { serverDATA, category } from '../types/types';
import SVG from './svgs';

export function serverListAddServerElement() {
  return `<div class="server_list_element add_server"><div class="element_info">Добавить сервер</div></div>`;
}

export function serverListElement(element: serverDATA) {
  return `<div class="server_list_element server_element" style="background-image: url(${element.imageUrl});" data-id="${element.id}"><div class="element_info">${element.serverName}</div></div>`;
}

export function serverName(name: string) {
  return `<h1 class="server_name">${name}</h1>`;
}

export function serverCategory(category: category) {
  let ch = '';
  category.channels?.forEach((channel) => {
    ch += `<li class="channel_item">${
      channel.type === 'voice' ? SVG.voiceIco : '#'
    }<span>${channel.channelName}</span></li>`;
  });
  return `
  <div class="server_category">
    <div class="category_header" onclick="toggleCategory()">
        <span>${category.categoryName}</span>
        <span class="toggle_icon">-</span>
    </div>
    <ul class="channel_list">
    ${ch}
    </ul>
  </div>`;
}

export function myProfile() {
  const username = localStorage.getItem('username');
  return `<div class="profile_avatar">
  </div><div class="profile_name">${username}</div>
  <div class="profile_buttons">${SVG.micro}${SVG.headphones}</div>`;
}
