import { closeAuthModal, showLogin } from './authUIController';
import { authApi } from '../api/authApi';
import { saveUserData } from './cache';
import { logInRender } from './render';

export async function guestLoginHandler() {
  try {
    const data = await authApi.guestLogin();
    localStorage.setItem('token', data.token);
    alert('Вы вошли как гость');
    closeAuthModal();
  } catch (error) {
    console.error('Ошибка при входе как гость:', error);
    alert('Ошибка при входе как гость');
  }
}

export async function handleRegister(event: Event) {
  event.preventDefault();
  const username = (
    document.getElementById('registerUsername') as HTMLInputElement
  ).value;
  const password = (
    document.getElementById('registerPassword') as HTMLInputElement
  ).value;
  const confirmPassword = (
    document.getElementById('registerConfirmPassword') as HTMLInputElement
  ).value;

  if (password !== confirmPassword) {
    alert('Пароли не совпадают');
    return;
  }

  try {
    const data = await authApi.register(username, password);
    alert('Регистрация прошла успешно');
    showLogin(); // Переход на вкладку "Войти" после успешной регистрации
  } catch (error) {
    console.error(
      'Ошибка при регистрации:',
      (error as any).response.data.error,
    );
    alert((error as any).response.data.error);
  }
}

export async function handleLogin(event: Event) {
  event.preventDefault();
  const username = (
    document.getElementById('loginUsername') as HTMLInputElement
  ).value;
  const password = (
    document.getElementById('loginPassword') as HTMLInputElement
  ).value;

  try {
    const data = await authApi.login(username, password);
    localStorage.setItem('token', data.token);
    saveUserData(data.userId, data.username, data.userAvatar);
    closeAuthModal();
    logInRender();
  } catch (error) {
    if (error instanceof Error && (error as any).response) {
      const axiosError = error as any;
      if (axiosError.response.status === 401) {
        // Если сервер возвращает статус 401 Unauthorized
        alert('Неверное имя пользователя или пароль');
      }
    } else {
      // Обработка других ошибок
      console.error('Ошибка при входе:', error);
      alert('Ошибка при входе');
    }
  }
}

async function checkTokenValidity(token: string) {
  try {
    const response = await authApi.verifyToken(token);
    return response;
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    return false;
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

  const response = await checkTokenValidity(token);
  if (response.valid) {
    saveUserData(
      response.decoded.id,
      response.decoded.username,
      response.decoded.userAvatar,
    );
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
