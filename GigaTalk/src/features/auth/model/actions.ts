import { userStore } from '../../../entities/user/model/store.ts';
import { authApi } from '../api.ts';
import { closeAuthModal, showLogin } from '../ui/AuthModal.ts';

/**
 * Регистрация пользователя.
 * @param event Событие формы.
 */
export async function handleRegister(event: Event) {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const username = (form.elements.namedItem('username') as HTMLInputElement)
    .value;
  const password = (form.elements.namedItem('password') as HTMLInputElement)
    .value;
  const confirmPassword = (
    form.elements.namedItem('confirmPassword') as HTMLInputElement
  ).value;

  try {
    if (password !== confirmPassword) {
      throw new Error('Пароли не совпадают');
    }
    await authApi.register(username, password);
    showLogin();
    console.log('Регистрация прошла успешно');
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    throw error;
  }
}

/**
 * Авторизация пользователя.
 * @param event Событие формы.
 */
export async function handleLogin(event: Event) {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const username = (form.elements.namedItem('username') as HTMLInputElement)
    .value;
  const password = (form.elements.namedItem('password') as HTMLInputElement)
    .value;

  try {
    const data = await authApi.login(username, password);
    localStorage.setItem('token', data.token);

    // Обновляем состояние пользователя
    userStore.setState({
      id: data.userId,
      name: data.username,
      avatar: data.userAvatar,
    });

    closeAuthModal();
  } catch (error) {
    console.error('Ошибка входа:', error);
    throw error;
  }
}

/**
 * Вход как гость.
 *
 */
export async function guestLogin() {
  try {
    const data = await authApi.guestLogin();
    localStorage.setItem('token', data.token);

    // Обновляем состояние пользователя
    userStore.setState({
      id: data.userId,
      name: data.username,
      avatar: data.userAvatar,
    });

    closeAuthModal();
  } catch (error) {
    console.error('Ошибка входа как гостя:', error);
    throw error;
  }
}

export async function getInCheck() {
  const authModal = document.getElementById('authModal');
  const token = localStorage.getItem('token');

  // Если токена нет, показываем модальное окно и завершаем проверку
  if (!token) {
    if (authModal) {
      authModal.classList.remove('hidden');
    }
    return false;
  }

  const isValid = await authApi.verifyToken(token);
  if (isValid) {
    return true;
  } else {
    // Если токен недействителен, удаляем его и показываем модальное окно
    localStorage.removeItem('token');
    if (authModal) {
      authModal.classList.remove('hidden');
    }
    return false;
  }
}
