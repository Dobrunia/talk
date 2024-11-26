import { setMyServersList } from '../../../entities/server/model/actions.ts';
import { updateMyInfo } from '../../../entities/user/model/actions.ts';
import { userStore } from '../../../entities/user/model/store.ts';
import { renderProfile } from '../../profile/ui/myProfile.ts';
import { renderProfileModal } from '../../profile/ui/ProfileModal.ts';
import { renderServersList } from '../../serverComponent/model/actions.ts';
import { renderSettingsModal } from '../../settings/ui/SettingsModal.ts';
import { authApi } from '../api.ts';
import { closeAuthModal, openAuthModal, showLogin } from '../ui/AuthModal.ts';

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
    logInRender();
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

    logInRender();
  } catch (error) {
    console.error('Ошибка входа как гостя:', error);
    throw error;
  }
}

export async function getInCheck() {
  const token = localStorage.getItem('token');

  // Если токена нет, показываем модальное окно и завершаем проверку
  if (!token) {
    logOut();
    return false;
  }

  try {
    const isValid = await authApi.verifyToken(token);
    if (isValid) {
      await updateMyInfo();
      logInRender();
      return true;
    } else {
      logOut();
      return false;
    }
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    logOut();
    return false;
  }
}

function logInRender() {
  closeAuthModal();
  renderProfile();
  renderProfileModal();
  setMyServersList();
  renderServersList();
  renderSettingsModal();
}

export function logOut() {
  localStorage.removeItem('token');
  userStore.resetState();
  openAuthModal();
  //window.location.reload(); // Обновление страницы для удаления всех сессий и кэшированных данных
}
