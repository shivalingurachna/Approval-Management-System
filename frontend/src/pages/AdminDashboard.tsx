import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AdminStats, LoginLogItem, User, UserStatus } from '../types';

interface AdminDashboardProps {
  token: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LoginLogItem[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [filter, setFilter] = useState<string>('PENDING');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'users') {
        const [fetchedUsers, fetchedStats] = await Promise.all([
          api.getAdminUsers(token, filter === 'ALL' ? undefined : filter),
          api.getAdminStats(token),
        ]);
        setUsers(fetchedUsers);
        setStats(fetchedStats);
      } else {
        const fetchedLogs = await api.getLoginLogs(token);
        setLogs(fetchedLogs);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to fetch directory data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, activeTab]);

  const handleUpdateStatus = async (userId: string, newStatus: UserStatus) => {
    try {
      setActionLoadingId(userId);
      setMessage(null);
      await api.updateUserStatus(token, userId, newStatus);
      setMessage({
        text: `User status successfully updated to ${newStatus}.`,
        type: 'success',
      });
      await fetchData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update user status', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Administration Console</h1>
        </div>
        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          Refresh
        </button>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {message.text}
        </div>
      )}

      {/* Main Mode Selector */}
      <div className="account-type-toggle" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`toggle-option ${activeTab === 'users' ? 'selected' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Directory & Approvals
        </button>
        <button
          type="button"
          className={`toggle-option ${activeTab === 'logs' ? 'selected' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Database Login Logs
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* KPI Counters */}
          {stats && (
            <div className="stats-grid">
              <div
                className={`stat-card ${filter === 'PENDING' ? 'active-stat' : ''}`}
                onClick={() => setFilter('PENDING')}
              >
                <div className="stat-label">Pending Approval</div>
                <div className="stat-value text-warning">{stats.pending}</div>
              </div>
              <div
                className={`stat-card ${filter === 'APPROVED' ? 'active-stat' : ''}`}
                onClick={() => setFilter('APPROVED')}
              >
                <div className="stat-label">Approved Members</div>
                <div className="stat-value text-success">{stats.approved}</div>
              </div>
              <div
                className={`stat-card ${filter === 'REJECTED' ? 'active-stat' : ''}`}
                onClick={() => setFilter('REJECTED')}
              >
                <div className="stat-label">Declined Requests</div>
                <div className="stat-value text-danger">{stats.rejected}</div>
              </div>
              <div
                className={`stat-card ${filter === 'ALL' ? 'active-stat' : ''}`}
                onClick={() => setFilter('ALL')}
              >
                <div className="stat-label">Total Accounts</div>
                <div className="stat-value">{stats.totalUsers}</div>
              </div>
            </div>
          )}

          {/* Control Bar: Filters & Search */}
          <div className="directory-controls">
            <div className="filter-bar">
              <button
                className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
                onClick={() => setFilter('PENDING')}
              >
                Pending ({stats?.pending ?? 0})
              </button>
              <button
                className={`filter-btn ${filter === 'APPROVED' ? 'active' : ''}`}
                onClick={() => setFilter('APPROVED')}
              >
                Approved ({stats?.approved ?? 0})
              </button>
              <button
                className={`filter-btn ${filter === 'REJECTED' ? 'active' : ''}`}
                onClick={() => setFilter('REJECTED')}
              >
                Declined ({stats?.rejected ?? 0})
              </button>
              <button
                className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilter('ALL')}
              >
                All Accounts ({stats?.totalUsers ?? 0})
              </button>
            </div>

            <input
              type="text"
              className="search-input"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* User Records Table */}
          <div className="card table-card">
            {loading ? (
              <div className="loading-state">Loading user records from database...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <p>No user records found matching criteria.</p>
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Email Address</th>
                    <th>Status</th>
                    <th>Registered At</th>
                    <th>Last Login</th>
                    <th style={{ textAlign: 'right' }}>Authorization Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isProcessing = actionLoadingId === u._id;
                    return (
                      <tr key={u._id}>
                        <td>
                          <div className="user-profile-cell">
                            <span className="avatar-placeholder">{u.name.charAt(0).toUpperCase()}</span>
                            <strong>{u.name}</strong>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge status-${u.status.toLowerCase()}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </td>
                        <td>
                          {u.lastLogin
                            ? new Date(u.lastLogin).toLocaleString()
                            : <span style={{ color: '#64748b' }}>Never logged in</span>}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="action-buttons">
                            {u.status === 'PENDING' ? (
                              <>
                                <button
                                  className="btn btn-accept"
                                  disabled={isProcessing}
                                  onClick={() => handleUpdateStatus(u._id, 'APPROVED')}
                                >
                                  Accept
                                </button>
                                <button
                                  className="btn btn-reject"
                                  disabled={isProcessing}
                                  onClick={() => handleUpdateStatus(u._id, 'REJECTED')}
                                >
                                  Reject
                                </button>
                              </>
                            ) : u.status === 'REJECTED' ? (
                              <button
                                className="btn btn-accept"
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(u._id, 'APPROVED')}
                              >
                                Re-Approve
                              </button>
                            ) : (
                              <button
                                className="btn btn-reject-outline"
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(u._id, 'REJECTED')}
                              >
                                Revoke Access
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        /* Database Login Activity Logs Tab */
        <div className="card table-card">
          {loading ? (
            <div className="loading-state">Loading database login logs...</div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <p>No login records stored yet in the database.</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>IP Address</th>
                  <th>Login Timestamp (MongoDB)</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td><strong>{log.name}</strong></td>
                    <td>{log.email}</td>
                    <td>
                      <span className={`badge role-${log.role}`}>
                        {log.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-${log.status.toLowerCase()}`}>
                        {log.status}
                      </span>
                    </td>
                    <td><code>{log.ipAddress}</code></td>
                    <td>{new Date(log.loginAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
