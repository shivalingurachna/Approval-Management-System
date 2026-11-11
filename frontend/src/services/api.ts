import type { AdminStats, AuthResponse, LoginLogItem, User, UserStatus } from '../types';

const API_BASE = '/api';

// Helper for error handling
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg) as Error & { status?: number; dataStatus?: string };
    err.status = res.status;
    err.dataStatus = data.status;
    throw err;
  }
  return data as T;
}

export const api = {
  // Step 1 check: see if admin already exists
  async checkHasAdmin(): Promise<{ hasAdmin: boolean }> {
    const res = await fetch(`${API_BASE}/auth/has-admin`);
    return handleResponse(res);
  },

  // Step 1: Admin Registration
  async registerAdmin(payload: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Step 3: User Registration
  async registerUser(payload: { name: string; email: string; password: string }): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Step 2 & 5: Login for Admin and Users
  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Step 6: Get current user profile
  async getProfile(token: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  // Step 4: Admin views users
  async getAdminUsers(token: string, status?: string): Promise<User[]> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/admin/users${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  // Step 4: Admin views stats
  async getAdminStats(token: string): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  // Step 4: Admin clicks Accept or Reject
  async updateUserStatus(
    token: string,
    userId: string,
    status: UserStatus
  ): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // Admin views login activity logs stored in database
  async getLoginLogs(token: string): Promise<LoginLogItem[]> {
    const res = await fetch(`${API_BASE}/admin/login-logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },
};
