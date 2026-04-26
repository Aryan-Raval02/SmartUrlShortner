import axios from 'axios';
import type { ApiErrorResponse } from './urlApi';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept errors to extract backend error response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      // Backend returns ApiErrorResponse structure
      return Promise.reject(error.response.data as ApiErrorResponse);
    }
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      status: 500
    } as ApiErrorResponse);
  }
);

export default api;
