// Типы состояния пользователя
export type UserStore = {
  id: string | null; // Идентификатор пользователя
  name: string | null; // Имя пользователя
  avatar: string | null; // URL аватара
  currentChannelId: string | null; // Текущий канал
  isMicrophoneMuted: boolean; // Статус микрофона
  isSoundMuted: boolean; // Статус звука
};

export type User = {
  id: number; // Уникальный идентификатор пользователя (первичный ключ)
  username: string; // Имя пользователя
  password: string; // Пароль
  avatar?: string | null; // Ссылка на аватар (может быть null)
  permission: number; // Уровень разрешений/прав пользователя
  lastLogin?: string | null; // Последняя дата входа (может быть null)
  status?: string | null; // Текущий статус пользователя (может быть null)
  bio?: string | null; // Биография пользователя (может быть null)
  createdAt: string; // Дата создания аккаунта
  isGuest: boolean; // Флаг гостевого аккаунта (0 или 1)
};
