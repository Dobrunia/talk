export function userInChannel(
  userId: string,
  username: string,
  userAvatar: string | null,
): HTMLElement {
  // Создаем основной контейнер
  const userContainer = document.createElement('div');
  userContainer.className = 'user_in_channel';
  userContainer.id = `user_in_channel_${userId}`;

  // Аватар пользователя
  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'user_in_channel_avatar';
  avatarDiv.style.backgroundImage = `url(${userAvatar ?? '/default_profile.jpg'})`;
  userContainer.appendChild(avatarDiv);

  // Имя пользователя
  const nameDiv = document.createElement('div');
  nameDiv.className = 'user_in_channel_name';
  nameDiv.textContent = username;
  userContainer.appendChild(nameDiv);

  return userContainer;
}
