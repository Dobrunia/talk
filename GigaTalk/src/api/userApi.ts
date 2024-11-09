import apiClient from './axiosInstance.ts';

export const userApi = {
  async changeUsername(newUsername: string) {
    const response = await apiClient.post('/changeUsername', { newUsername });
    return response.data;
  },
  async changeAvatar(base64String: string) {
    const response = await apiClient.post('/changeAvatar', { base64String });
    return response.data;
  },
};
