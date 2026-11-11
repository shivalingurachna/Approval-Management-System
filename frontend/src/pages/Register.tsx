import React, { useState } from 'react';
import { api } from '../services/api';
import type { AuthResponse } from '../types';

interface RegisterProps {
  hasAdmin: boolean;
  onAdminRegistered: (data: AuthResponse) => void;
  onNavigateLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({
  hasAdmin,
  onAdminRegistered,
  onNavigateLogin,
}) => {
  const [accountType, setAccountType] = useState<'user' | 'admin'>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userCreatedMessage, setUserCreatedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (accountType === 'admin') {
        const res = await api.registerAdmin({ name, email, password });
        onAdminRegistered(res);
      } else {
        const res = await api.registerUser({ name, email, password });
        setUserCreatedMessage(
          res.message || 'Your account has been registered and is awaiting administrator approval.'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (userCreatedMessage) {
    return (
      <div className="card auth-card">
        <h2>Request Submitted</h2>
        <div className="alert alert-warning">
          {userCreatedMessage}
        </div>
        <button className="btn btn-primary" onClick={onNavigateLogin}>
          Log in
        </button>
      </div>
    );
  }

  return (
    <div className="card auth-card">
      <h2>Create Account</h2>

      {/* Account Type Toggle */}
      <div className="account-type-toggle">
        <button
          type="button"
          className={`toggle-option ${accountType === 'user' ? 'selected' : ''}`}
          onClick={() => {
            setAccountType('user');
            setError(null);
          }}
        >
          User
        </button>
        <button
          type="button"
          className={`toggle-option ${accountType === 'admin' ? 'selected' : ''}`}
          onClick={() => {
            setAccountType('admin');
            setError(null);
          }}
        >
          Administrator
        </button>
      </div>

      {accountType === 'admin' && hasAdmin ? (
        <div className="admin-exists-notice">
          <div className="alert alert-info">
            An administrator already exists for this system.
          </div>
          <div className="action-buttons-stack">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setAccountType('user')}
            >
              Register as User
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNavigateLogin}
            >
              Sign In
            </button>
          </div>
        </div>
      ) : (
        <>
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
              />
            </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : accountType === 'admin' ? 'Register Admin' : 'Create Account'}
            </button>
          </form>
        </>
      )}

      <div className="card-footer">
        Already have an account?{' '}
        <span className="link-text" onClick={onNavigateLogin}>
          Sign In
        </span>
      </div>
    </div>
  );
};
