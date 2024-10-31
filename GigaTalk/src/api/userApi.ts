import apiClient from './axiosInstance.ts';

export const userApi = {
  // Получить список пользователей
  async getUsers() {
    const response = await apiClient.get('/users');
    return response.data;
  },
};
