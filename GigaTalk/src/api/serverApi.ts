import apiClient from './axiosInstance.ts';

export const serverApi = {
  async getAllMyServers() {
    const response = await apiClient.get('/getAllMyServers');
    return response.data;
  },

  async getMyServerInfoById(serverId: string) {
    const response = await apiClient.get(`/getMyServerInfoById/${serverId}`);
    return response.data;
  },
};
