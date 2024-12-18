import apiClient from '../../app/api/axiosInstance.ts';

export const authApi = {
  async register(username: string, password: string) {
    const response = await apiClient.post('/register', { username, password });
    return response.data;
  },

  async login(username: string, password: string) {
    const response = await apiClient.post('/login', { username, password });
    return response.data;
  },

  async guestLogin() {
    const response = await apiClient.post('/guest-login');
    return response.data;
  },

  async verifyToken(token: string): Promise<boolean> {
    const response = await apiClient.get('/verify-token', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.valid;
  },
};
