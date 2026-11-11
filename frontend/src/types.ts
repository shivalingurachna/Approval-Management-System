export type UserRole = 'user' | 'admin';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
  createdAt?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
  token: string;
  message?: string;
}

export interface AdminStats {
  pending: number;
  approved: number;
  rejected: number;
  totalUsers: number;
}

export interface LoginLogItem {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  ipAddress: string;
  loginAt: string;
}
