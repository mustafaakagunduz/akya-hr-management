import { apiClient } from './client';
import type { AdminUpdateUserPayload, User } from './types';

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

export function resetUserBalance(id: string) {
  return apiClient
    .post<Omit<User, 'password'>>(`/users/${id}/reset-balance`)
    .then((res) => res.data);
}

export function deactivateUser(id: string) {
  return apiClient
    .post<Omit<User, 'password'>>(`/users/${id}/deactivate`)
    .then((res) => res.data);
}

export function activateUser(id: string) {
  return apiClient
    .post<Omit<User, 'password'>>(`/users/${id}/activate`)
    .then((res) => res.data);
}

export function adminUpdateUser(id: string, payload: AdminUpdateUserPayload) {
  return apiClient
    .patch<Omit<User, 'password'>>(`/users/${id}`, payload)
    .then((res) => res.data);
}
