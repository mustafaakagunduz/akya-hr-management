export type UserRole = 'EMPLOYEE' | 'MANAGER';
export type LeaveType = 'DAILY' | 'ANNUAL';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Department =
  | 'HR'
  | 'SOFTWARE'
  | 'SALES'
  | 'MARKETING'
  | 'FINANCE'
  | 'OPERATIONS';
export type Position =
  | 'INTERN'
  | 'SPECIALIST'
  | 'TEAM_LEAD'
  | 'MANAGER'
  | 'DIRECTOR';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  phone: string;
  department: Department;
  position: Position;
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
  department: Department | '';
  position: Position | '';
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
