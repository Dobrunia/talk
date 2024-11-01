import { closeAuthModal, showLogin } from './authUIController';
import { authApi } from '../api/authApi';
import { renderProfile } from '../ui-kit';

async function guestLoginHandler() {
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

async function handleRegister(event: Event) {
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
    console.error('Ошибка при регистрации:', error);
    alert('Ошибка при регистрации');
  }
}

async function handleLogin(event: Event) {
  event.preventDefault();
  const username = (
    document.getElementById('loginUsername') as HTMLInputElement
  ).value;
  const password = (
    document.getElementById('loginPassword') as HTMLInputElement
  ).value;

  try {
    const data = await authApi.login(username, password);

    // Сохраняем token, userId и username в localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId.toString());
    localStorage.setItem('username', data.username);
    renderProfile();
    //alert('Вы успешно вошли в систему');
    closeAuthModal();
  } catch (error) {
    console.error('Ошибка при входе:', error);
    alert('Ошибка при входе');
  }
}

async function checkTokenValidity() {
  const authModal = document.getElementById('authModal');

  // Сначала скрываем модальное окно, пока проверяем токен
  if (authModal) {
    authModal.classList.add('hidden');
  }

  const token = localStorage.getItem('token');

  // Если токена нет, показываем модальное окно и завершаем проверку
  if (!token) {
    if (authModal) {
      authModal.classList.remove('hidden');
    }
    return;
  }

  try {
    // Вызов API для проверки токена
    const response = await authApi.verifyToken(token);

    // Если токен действителен, скрываем модальное окно
    if (response.valid) {
      closeAuthModal();
      renderProfile();
    } else {
      // Если токен недействителен, удаляем его и показываем модальное окно
      localStorage.removeItem('token');
      if (authModal) {
        authModal.classList.remove('hidden');
      }
    }
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    localStorage.removeItem('token');
    // Показываем модальное окно в случае ошибки проверки
    if (authModal) {
      authModal.classList.remove('hidden');
    }
  }
}

checkTokenValidity();

window.guestLoginHandler = guestLoginHandler;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
