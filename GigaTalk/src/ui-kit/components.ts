import { serverDATA, category } from '../types/types';
import SVG from './svgs';

export function serverListAddServerElement() {
  return `<div class="server_list_element add_server"><div class="element_info">Добавить сервер</div></div>`;
}

export function serverListElement(server: serverDATA) {
  return `<div class="server_list_element" onclick="serverClickHandler(${server.id})" style="background-image: url(${server.imageUrl});"><div class="element_info">${server.name}</div></div>`;
}

export function serverName(name: string) {
  return `<h1 class="server_name">${name}</h1>`;
}

export function serverCategory(category: category) {
  let ch = '';
  category.channels?.forEach((channel) => {
    ch += `<li class="channel_item">
    <div class="channel_name" onclick="voiceChannelClick(${channel.id})">
      ${channel.type === 'voice' ? SVG.voiceIco : '#'}
      <div>${channel.name}</div>
    </div>
    <ul class="user_list" id="user_list_${channel.id}"></ul>
    </li>`;
  });
  return `
  <div class="server_category">
    <div class="category_header" onclick="toggleCategory(${category.id})">
        <span>${category.name}</span>
        <span class="toggle_icon" id="toggle_icon_${category.id}">-</span>
    </div>
    <ul class="channel_list" id="channel_list_${category.id}">
    ${ch}
    </ul>
  </div>`;
}

export function myProfile(username: string) {
  return `<div class="profile_avatar">
  </div><div class="profile_name">${username}</div>
  <div class="profile_buttons">${SVG.micro}${SVG.headphones}</div>`;
}

export function userInChannel(username: string, userId: string) {
  return `<div class="user_in_channel" id="user_in_channel_${userId}">
  <div class="user_in_channel_avatar"></div>
  <div class="user_in_channel_name">${username}</div>
  </div>`;
}
