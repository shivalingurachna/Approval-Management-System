import React from 'react';
import type { User } from '../types';

interface HomeProps {
  user: User;
  onLogout: () => void;
}

export const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
  return (
    <div className="home-container">
      <div className="card home-hero">
        <div className="hero-status">
          <span className="status-pill status-approved">
            Active Account
          </span>
        </div>
        <h1>Welcome, {user.name}</h1>

        <div className="profile-details-card">
          <div className="profile-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">{user.email}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Role</span>
            <span className="profile-value uppercase">{user.role}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Status</span>
            <span className="badge status-approved">{user.status}</span>
          </div>
          {user.lastLogin && (
            <div className="profile-row">
              <span className="profile-label">Last Login</span>
              <span className="profile-value">{new Date(user.lastLogin).toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="home-actions">
          <button className="btn btn-secondary" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
