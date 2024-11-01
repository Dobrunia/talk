import apiClient from './axiosInstance';

export const authApi = {
  // Регистрация пользователя
  async register(username: string, password: string) {
    console.log('register', username, password);
    const response = await apiClient.post('/register', { username, password });
    return response.data;
  },

  // Вход пользователя
  async login(username: string, password: string) {
    const response = await apiClient.post('/login', { username, password });
    return response.data;
  },

  // Гостевой вход
  async guestLogin() {
    const response = await apiClient.post('/guest-login');
    return response.data;
  },
  async verifyToken(token: string) {
    const response = await apiClient.get('/verify-token', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
