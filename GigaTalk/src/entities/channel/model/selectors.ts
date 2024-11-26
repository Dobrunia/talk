import { Channel } from "../types.ts";
import channelStore from "./store.ts";

// Получить текущий канал
export function getCurrentChannel(): Channel | null {
  return channelStore.getState().currentChannel;
}

// Получить ID текущего канала
export function getCurrentChannelId(): string | null {
  const currentChannel = channelStore.getState().currentChannel;
  return currentChannel ? currentChannel.id : null;
}

// Получить имя текущего канала
export function getCurrentChannelName(): string | null {
  const currentChannel = channelStore.getState().currentChannel;
  return currentChannel ? currentChannel.name : null;
}

// Проверить, является ли текущий канал голосовым
export function isCurrentChannelVoice(): boolean {
  const currentChannel = channelStore.getState().currentChannel;
  return currentChannel?.type === 'voice';
}

// Проверить, является ли текущий канал текстовым
export function isCurrentChannelText(): boolean {
  const currentChannel = channelStore.getState().currentChannel;
  return currentChannel?.type === 'text';
}
