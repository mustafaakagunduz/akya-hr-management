import { apiClient } from './client';
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from './types';

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

export function updateProfile(payload: UpdateProfilePayload) {
  return apiClient.patch<User>('/users/me', payload).then((res) => res.data);
}

export function changePassword(payload: ChangePasswordPayload) {
  return apiClient
    .patch<{ success: boolean }>('/users/me/password', payload)
    .then((res) => res.data);
}
