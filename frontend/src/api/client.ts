import axios from 'axios';
import type { TFunction } from 'i18next';
import { BACKEND_MESSAGE_KEYS } from './errorMessages';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

function translateBackendMessage(message: string, t: TFunction): string {
  const key = BACKEND_MESSAGE_KEYS[message];
  return key ? t(key) : message;
}

export function getApiErrorMessage(
  error: unknown,
  t: TFunction,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    if (Array.isArray(data?.message)) {
      return data.message
        .map((message) => translateBackendMessage(message, t))
        .join(', ');
    }
    if (typeof data?.message === 'string') {
      return translateBackendMessage(data.message, t);
    }
  }
  return fallback;
}
