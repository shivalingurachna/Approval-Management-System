import React, { useState } from 'react';
import { api } from '../services/api';
import type { AuthResponse } from '../types';

interface LoginProps {
  onSuccess: (data: AuthResponse) => void;
  onNavigateRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onSuccess,
  onNavigateRegister,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ message: string; type: 'danger' | 'warning' | 'rejected' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.login({ email, password });
      onSuccess(data);
    } catch (err: any) {
      if (err.dataStatus === 'PENDING') {
        setError({
          type: 'warning',
          message: 'Account Pending: Awaiting administrator approval.',
        });
      } else if (err.dataStatus === 'REJECTED') {
        setError({
          type: 'rejected',
          message: 'Access Denied: Your registration was declined by the administrator.',
        });
      } else {
        setError({
          type: 'danger',
          message: err.message || 'Invalid email or password.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h2>Log in</h2>

      {error && (
        <div
          className={`alert ${
            error.type === 'warning'
              ? 'alert-warning'
              : error.type === 'rejected'
              ? 'alert-rejected'
              : 'alert-danger'
          }`}
        >
          {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <div className="card-footer">
        Don't have an account?{' '}
        <span className="link-text" onClick={onNavigateRegister}>
          Create account
        </span>
      </div>
    </div>
  );
};
