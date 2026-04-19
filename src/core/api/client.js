import axios from 'axios';
import { useAuthStore } from '@core/stores/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      const { token, logoutLocal } = useAuthStore.getState();
      if (token) logoutLocal();
    }
    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error) {
  const data = error.response?.data;
  const message =
    data?.message ||
    data?.error ||
    error.message ||
    'Something went wrong. Please try again.';
  const err = new Error(message);
  err.status = error.response?.status;
  err.data = data;
  return err;
}

/** Unwrap ApiResponse<T> envelope from the server. */
export function unwrap(response) {
  const body = response?.data;
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body;
}
