import { closeAuthModal, showLogin } from './authUIController';
import { authApi } from '../api/authApi';

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
    localStorage.setItem('token', data.token);
    alert('Вы успешно вошли в систему');
    closeAuthModal();
  } catch (error) {
    console.error('Ошибка при входе:', error);
    alert('Ошибка при входе');
  }
}

window.guestLoginHandler = guestLoginHandler;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
