import apiClient from './axiosInstance.ts';

export const serverApi = {
  // Получить список всех серверов
  async getUsers() {
    const response = await apiClient.get('/servers');
    return response.data;
  },
};
