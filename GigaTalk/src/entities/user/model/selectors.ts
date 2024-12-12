import { userStore } from './store.ts';

export function getUserId(): string | null {
  return userStore.getState().id;
}

export function getUsername(): string | null {
  return userStore.getState().name;
}

export function getAvatar(): string | null {
  return userStore.getState().avatar;
}

export function getCurrentChannel(): string | null {
  return userStore.getState().currentChannelId;
}
