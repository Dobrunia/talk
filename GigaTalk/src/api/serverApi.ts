import apiClient from './axiosInstance.ts';

export const serverApi = {
  // Получить список всех серверов
  async getAllServers() {
    const response = await apiClient.get('/getAllServers');
    return response.data;
  },
  async getServerById(serverId: number) {
    const response = await apiClient.get(`/getServerById/${serverId}`);
    return response.data;
  },
};
