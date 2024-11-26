import { jwtDecode } from 'jwt-decode';
import { setUserId } from '../../entities/user/model/actions.ts';

type DecodedToken = {
  id: string;
};

export function decodeAndStoreToken(token: string): void {
  try {
    // Декодируем токен
    const decoded: DecodedToken = jwtDecode(token);
    const { id } = decoded;

    // Сохраняем данные
    setUserId(id);
    localStorage.setItem('token', token);

    console.log('Данные пользователя сохранены:', id);
  } catch (error) {
    console.error('Ошибка при декодировании токена:', error);
  }
}
