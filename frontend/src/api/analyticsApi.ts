import axiosInstance from './axiosInstance';

export const analyticsApi = {
  getAnalytics: (urlId: number) => axiosInstance.get(`/api/v1/analytics/${urlId}`),
  getDashboard: () => axiosInstance.get('/api/v1/analytics/dashboard'),
  getClickLogs: (urlId: number, page = 0, size = 20) =>
    axiosInstance.get(`/api/v1/analytics/${urlId}/clicks?page=${page}&size=${size}`),
};
