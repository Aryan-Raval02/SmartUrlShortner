import axiosInstance from './axiosInstance';

export const authApi = {
  register: (data: {
    fullName: string; username: string; email: string; password: string;
  }) => axiosInstance.post('/api/v1/auth/register', data),

  login: (data: { email: string; password: string }) =>
    axiosInstance.post('/api/v1/auth/login', data),

  refresh: (refreshToken: string) =>
    axiosInstance.post('/api/v1/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    axiosInstance.post('/api/v1/auth/logout', { refreshToken }),

  forgotPassword: (email: string) =>
    axiosInstance.post('/api/v1/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; newPassword: string; confirmPassword: string }) =>
    axiosInstance.post('/api/v1/auth/reset-password', data),

  resendVerification: () =>
    axiosInstance.post('/api/v1/auth/verify-email/resend'),

  verifyEmail: (token: string) =>
    axiosInstance.get(`/api/v1/auth/verify-email?token=${token}`),

  getPublicStats: () =>
    axiosInstance.get('/api/v1/public/stats'),
};
