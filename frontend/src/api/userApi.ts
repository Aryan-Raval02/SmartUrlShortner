import axiosInstance from './axiosInstance';

export const userApi = {
  getProfile: () => axiosInstance.get('/api/v1/users/me'),
  updateProfile: (data: { fullName?: string; username?: string; phoneNumber?: string }) =>
    axiosInstance.put('/api/v1/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    axiosInstance.put('/api/v1/users/me/password', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosInstance.post('/api/v1/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getSessions: () => axiosInstance.get('/api/v1/users/me/sessions'),
  revokeSession: (sessionId: number) => axiosInstance.delete(`/api/v1/users/me/sessions/${sessionId}`),
  deleteAccount: (password: string) => axiosInstance.delete('/api/v1/users/me', { data: { password } }),
};
