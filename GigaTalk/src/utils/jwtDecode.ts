import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  id: string;
  username: string;
  userAvatar: string;
  permission: number;
};

export function decodeAndStoreToken(token: string): void {
  try {
    // Декодируем токен
    const decoded: DecodedToken = jwtDecode(token);
    const { id } = decoded;

    // Записываем данные в localStorage
    localStorage.setItem('userId', id);
    localStorage.setItem('token', token);

    console.log('Данные пользователя сохранены в localStorage:', id);
  } catch (error) {
    console.error('Ошибка при декодировании токена:', error);
  }
}
