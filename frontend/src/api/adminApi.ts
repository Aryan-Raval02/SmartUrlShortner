import axiosInstance from './axiosInstance';

export const adminApi = {
  // Users
  listUsers: (page = 0, size = 20) => axiosInstance.get(`/api/v1/admin/users?page=${page}&size=${size}`),
  getUserDetail: (id: number) => axiosInstance.get(`/api/v1/admin/users/${id}`),
  toggleBlockUser: (id: number) => axiosInstance.put(`/api/v1/admin/users/${id}/block`),
  changeUserRole: (id: number, role: string) => axiosInstance.put(`/api/v1/admin/users/${id}/role`, { role }),
  deleteUser: (id: number) => axiosInstance.delete(`/api/v1/admin/users/${id}`),
  bulkBlockUsers: (ids: number[]) => axiosInstance.put('/api/v1/admin/users/bulk/block', { ids }),
  // URLs
  listAllUrls: (page = 0, size = 20) => axiosInstance.get(`/api/v1/admin/urls?page=${page}&size=${size}`),
  toggleDisableUrl: (id: number) => axiosInstance.put(`/api/v1/admin/urls/${id}/disable`),
  deleteUrl: (id: number) => axiosInstance.delete(`/api/v1/admin/urls/${id}`),
  bulkDeleteUrls: (ids: number[]) => axiosInstance.delete('/api/v1/admin/urls/bulk', { data: { ids } }),
  bulkDisableUrls: (ids: number[]) => axiosInstance.put('/api/v1/admin/urls/bulk/disable', { ids }),
  // Dashboard
  getDashboard: () => axiosInstance.get('/api/v1/admin/dashboard'),
};
