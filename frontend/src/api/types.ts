export type UserRole = 'EMPLOYEE' | 'MANAGER';
export type LeaveType = 'DAILY' | 'ANNUAL';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  startDate: string;
  birthDate: string;
  role: UserRole;
  annualLeaveBalance: number;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'department' | 'position'>;
  type: LeaveType;
  startDate: string;
  endDate: string;
  dayCount: number;
  description: string | null;
  status: LeaveStatus;
  createdAt: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  startDate: string;
  birthDate: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateLeaveRequestPayload {
  type: LeaveType;
  startDate: string;
  endDate: string;
  description?: string;
}
