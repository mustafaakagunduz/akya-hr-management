import { apiClient } from './client';
import type { User } from './types';

export function fetchAllUsers() {
  return apiClient
    .get<Omit<User, 'password'>[]>('/users')
    .then((res) => res.data);
}

export function resetUserPassword(id: string) {
  return apiClient
    .post<{ newPassword: string }>(`/users/${id}/reset-password`)
    .then((res) => res.data);
}
