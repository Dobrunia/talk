import apiClient from './axiosInstance.ts';

export const serverApi = {
  // Получить список всех серверов
  async getAllServers() {
    const response = await apiClient.get('/servers');
    return response.data;
  },
};
