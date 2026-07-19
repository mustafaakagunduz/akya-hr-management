import { apiClient } from './client';
import type { LoginPayload, RegisterPayload, User } from './types';

export function login(payload: LoginPayload) {
  return apiClient
    .post<{ accessToken: string }>('/auth/login', payload)
    .then((res) => res.data);
}

export function register(payload: RegisterPayload) {
  return apiClient
    .post<Omit<User, 'password'>>('/auth/register', payload)
    .then((res) => res.data);
}

export function fetchMe() {
  return apiClient.get<User>('/auth/me').then((res) => res.data);
}
