import apiClient from '../api/axiosInstance';
import { closeAuthModal, showLogin } from './authUIController';

export async function guestLoginHandler() {
  try {
    const response = await apiClient.post('/guest-login');
    if (response.status === 200) {
      localStorage.setItem('token', response.data.token);
      alert('Вы вошли как гость');
      closeAuthModal();
    } else {
      alert('Ошибка при входе как гость');
    }
  } catch (error) {
    console.error('Ошибка при входе как гость:', error);
    alert('Ошибка при входе как гость');
  }
}

export async function handleRegister(event: Event) {
  event.preventDefault();
  const username = (document.getElementById('registerUsername') as HTMLInputElement).value;
  const password = (document.getElementById('registerPassword') as HTMLInputElement).value;
  const confirmPassword = (document.getElementById('registerConfirmPassword') as HTMLInputElement).value;

  if (password !== confirmPassword) {
    alert('Пароли не совпадают');
    return;
  }

  try {
    const response = await apiClient.post('/register', { username, password });
    if (response.status === 200) {
      alert('Регистрация прошла успешно');
      showLogin();
    } else {
      alert('Ошибка при регистрации');
    }
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    alert('Ошибка при регистрации');
  }
}

export async function handleLogin(event: Event) {
  event.preventDefault();
  const username = (document.getElementById('loginUsername') as HTMLInputElement).value;
  const password = (document.getElementById('loginPassword') as HTMLInputElement).value;

  try {
    const response = await apiClient.post('/login', { username, password });
    if (response.status === 200) {
      localStorage.setItem('token', response.data.token);
      alert('Вы успешно вошли в систему');
      closeAuthModal();
    } else {
      alert('Ошибка при входе');
    }
  } catch (error) {
    console.error('Ошибка при входе:', error);
    alert('Ошибка при входе');
  }
}

window.guestLoginHandler = guestLoginHandler;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
