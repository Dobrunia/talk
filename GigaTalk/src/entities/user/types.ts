// Типы состояния пользователя
export type UserStore = {
  id: string | null; // Идентификатор пользователя
  name: string | null; // Имя пользователя
  avatar: string | null; // URL аватара
  currentChannelId: string | null; // Текущий канал
  isMicrophoneMuted: boolean; // Статус микрофона
  isSoundMuted: boolean; // Статус звука
};
