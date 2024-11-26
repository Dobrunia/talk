import { userStore } from './store.ts';

// Установить пользователя
export function setUser(id: string, name: string, avatar: string) {
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

// Обновить статус микрофона на true (выключить микрофон)
export function muteMicrophone() {
  userStore.setState({ isMicrophoneMuted: true });
}

// Обновить статус микрофона на false (включить микрофон)
export function unmuteMicrophone() {
  userStore.setState({ isMicrophoneMuted: false });
}

// Обновить статус микрофона
export function toggleMicrophone() {
  const { isMicrophoneMuted } = userStore.getState();
  userStore.setState({ isMicrophoneMuted: !isMicrophoneMuted });
}

// Обновить статус звука на true (выключить звук)
export function muteSound() {
  userStore.setState({ isSoundMuted: true });
}

// Обновить статус звука на false (включить звук)
export function unmuteSound() {
  userStore.setState({ isSoundMuted: false });
}

// Переключить статус звука
export function toggleSound() {
  const { isSoundMuted } = userStore.getState();
  userStore.setState({ isSoundMuted: !isSoundMuted });
}

// Обновить текущий канал
export function setCurrentChannel(channelId: string) {
  userStore.setState({ currentChannelId: channelId });
}

// Сбросить пользователя
export function resetUser() {
  userStore.resetState();
}
