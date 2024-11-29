import apiClient from '../../app/api/axiosInstance.ts';

export const serverApi = {
  async getAllMyServers() {
    const response = await apiClient.get('/getAllMyServers');
    return response.data;
  },

  async getMyServerInfoById(serverId: string) {
    const response = await apiClient.get(`/getMyServerInfoById/${serverId}`);
    return JSON.stringify(response.data);
  },

  async getAllAvailableServers() {
    const response = await apiClient.get(`/getAllAvailableServers`);
    return response.data;
  },
};
