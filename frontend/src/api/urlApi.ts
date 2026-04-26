import api from './axiosInstance';

export interface CreateUrlRequest {
  originalUrl: string;
  customAlias?: string;
  title?: string;
  expiryDate?: string;
  password?: string;
}

export interface UrlResponse {
  id: number;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  title?: string;
  active: boolean;
  passwordProtected: boolean;
  expiryDate?: string;
  totalClicks: number;
  uniqueClicks: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  error: string;
  path: string;
  validationErrors?: Record<string, string>;
}

export const createShortUrl = async (data: CreateUrlRequest): Promise<ApiResponse<UrlResponse>> => {
  const response = await api.post<ApiResponse<UrlResponse>>('/urls', data);
  return response.data;
};

export const checkAliasAvailability = async (alias: string): Promise<ApiResponse<{ alias: string, available: boolean }>> => {
  const response = await api.get<ApiResponse<{ alias: string, available: boolean }>>(`/urls/check-alias?alias=${alias}`);
  return response.data;
};
