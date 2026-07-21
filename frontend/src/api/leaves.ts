import { apiClient } from './client';
import type { CreateLeaveRequestPayload, LeaveRequest } from './types';

export function createLeaveRequest(payload: CreateLeaveRequestPayload) {
  return apiClient
    .post<LeaveRequest>('/leaves', payload)
    .then((res) => res.data);
}

export function updateLeaveRequest(
  id: string,
  payload: CreateLeaveRequestPayload,
) {
  return apiClient
    .patch<LeaveRequest>(`/leaves/${id}`, payload)
    .then((res) => res.data);
}

export function deleteLeaveRequest(id: string) {
  return apiClient.delete<void>(`/leaves/${id}`).then(() => undefined);
}

export function fetchMyLeaveRequests() {
  return apiClient.get<LeaveRequest[]>('/leaves/my').then((res) => res.data);
}

export function fetchPendingLeaveRequests() {
  return apiClient
    .get<LeaveRequest[]>('/leaves/pending')
    .then((res) => res.data);
}

export function fetchLeaveHistory(scope?: 'all') {
  return apiClient
    .get<LeaveRequest[]>('/leaves/history', { params: scope ? { scope } : undefined })
    .then((res) => res.data);
}

export function approveLeaveRequest(id: string) {
  return apiClient
    .patch<LeaveRequest>(`/leaves/${id}/approve`)
    .then((res) => res.data);
}

export function rejectLeaveRequest(id: string) {
  return apiClient
    .patch<LeaveRequest>(`/leaves/${id}/reject`)
    .then((res) => res.data);
}

export function cancelLeaveRequest(id: string) {
  return apiClient
    .patch<LeaveRequest>(`/leaves/${id}/cancel`)
    .then((res) => res.data);
}
