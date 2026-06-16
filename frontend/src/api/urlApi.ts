import axiosInstance from './axiosInstance';

export interface CreateUrlPayload {
  originalUrl: string;
  customAlias?: string;
  title?: string;
  expiryDate?: string;
  password?: string;
  generateQR?: boolean;
}

export interface UpdateUrlPayload {
  title?: string;
  expiryDate?: string | null;
  active?: boolean;
  password?: string | null;
  removeExpiry?: boolean;
  removePassword?: boolean;
}

export interface UrlListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const urlApi = {
  create: (data: CreateUrlPayload) => axiosInstance.post('/api/v1/urls', data),
  list: (params: UrlListParams = {}) => axiosInstance.get('/api/v1/urls', { params }),
  getById: (id: number) => axiosInstance.get(`/api/v1/urls/${id}`),
  update: (id: number, data: UpdateUrlPayload) => axiosInstance.put(`/api/v1/urls/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/api/v1/urls/${id}`),
  checkAlias: (alias: string) => axiosInstance.get(`/api/v1/urls/check-alias?alias=${alias}`),
  getQrCode: (id: number) => axiosInstance.get(`/api/v1/urls/${id}/qr`, { responseType: 'blob' }),
  getPublicStats: () => axiosInstance.get('/api/v1/public/stats'),
};
