import React from 'react';
import type { User } from '../types';

interface NavbarProps {
  user: User | null;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  onNavigate,
  onLogout,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div
          className="navbar-brand"
          onClick={() => onNavigate(user ? (user.role === 'admin' ? 'dashboard' : 'home') : 'login')}
        >
          <span className="brand-symbol"></span>
          <span className="brand-text">Portal</span>
        </div>

        <nav className="navbar-links">
          {!user ? (
            <>
              <button
                className={`nav-btn ${activeView === 'login' ? 'active' : ''}`}
                onClick={() => onNavigate('login')}
              >
                Log in
              </button>
              <button
                className={`nav-btn nav-btn-primary ${activeView === 'register' ? 'active' : ''}`}
                onClick={() => onNavigate('register')}
              >
                Create account
              </button>
            </>
          ) : (
            <>
              {user.role === 'admin' ? (
                <button
                  className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
                  onClick={() => onNavigate('dashboard')}
                >
                  Admin Console
                </button>
              ) : (
                <button
                  className={`nav-btn ${activeView === 'home' ? 'active' : ''}`}
                  onClick={() => onNavigate('home')}
                >
                  Home
                </button>
              )}

              <div className="user-badge">
                <span className="user-name">{user.name}</span>
                <span className={`badge role-${user.role}`}>
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </span>
                {user.role === 'user' && (
                  <span className={`badge status-${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                )}
              </div>

              <button className="nav-btn logout-btn" onClick={onLogout}>
                Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
