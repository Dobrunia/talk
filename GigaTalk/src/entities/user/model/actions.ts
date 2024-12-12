import { userApi } from '../api.ts';
import { User } from '../types.ts';
import { userStore } from './store.ts';

export async function updateMyInfo() {
  const user: User = await userApi.getMyProfileInfo();
  const { id, avatar } = user;
  const name = user.username;
  setUser(id.toString(), name, avatar);
}

// Установить пользователя
export function setUser(
  id: string,
  name: string,
  avatar: string | null | undefined,
) {
  userStore.setState({ id, name, avatar });
}

export function setUserId(id: string) {
  userStore.setState({ id });
}

export function setUsername(name: string) {
  userStore.setState({ name });
}

export function setUserAvatar(avatar: string) {
  userStore.setState({ avatar });
}

// Обновить текущий канал
export function setCurrentChannel(channelId: string) {
  userStore.setState({ currentChannelId: channelId });
}

// Вышел из канала
export function resetCurrentChannel() {
  userStore.setState({ currentChannelId: null });
}

// Сбросить пользователя
export function resetUser() {
  userStore.resetState();
}
