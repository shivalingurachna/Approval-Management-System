import { useEffect, useState } from 'react';
import './App.css';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './pages/AdminDashboard';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { api } from './services/api';
import type { AuthResponse, User } from './types';

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });
  const [hasAdmin, setHasAdmin] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'login' | 'register' | 'dashboard' | 'home'>('login');
  const [initializing, setInitializing] = useState(true);

  // Check admin status and token validity on startup
  useEffect(() => {
    const init = async () => {
      try {
        const adminCheck = await api.checkHasAdmin();
        setHasAdmin(adminCheck.hasAdmin);

        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          try {
            const profile = await api.getProfile(storedToken);
            setUser(profile);
            localStorage.setItem('auth_user', JSON.stringify(profile));
            if (profile.role === 'admin') {
              setActiveView('dashboard');
            } else {
              setActiveView('home');
            }
          } catch {
            // Token expired or invalid
            handleLogout();
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setInitializing(false);
      }
    };

    init();
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    const currentUser: User = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
    };

    setUser(currentUser);
    setToken(data.token);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(currentUser));

    if (currentUser.role === 'admin') {
      setHasAdmin(true);
      setActiveView('dashboard');
    } else {
      setActiveView('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setActiveView('login');
  };

  const navigate = (view: string) => {
    const target = view as 'login' | 'register' | 'dashboard' | 'home';

    // Route guards
    if ((target === 'home' || target === 'dashboard') && !token) {
      setActiveView('login');
      return;
    }

    if (target === 'dashboard' && user?.role !== 'admin') {
      setActiveView('home');
      return;
    }

    if (target === 'home' && user?.role === 'admin') {
      setActiveView('dashboard');
      return;
    }

    setActiveView(target);
  };

  if (initializing) {
    return (
      <div className="init-screen">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar
        user={user}
        activeView={activeView}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activeView === 'register' && (
          <Register
            hasAdmin={hasAdmin}
            onAdminRegistered={handleAuthSuccess}
            onNavigateLogin={() => setActiveView('login')}
          />
        )}

        {activeView === 'login' && (
          <Login
            onSuccess={handleAuthSuccess}
            onNavigateRegister={() => setActiveView('register')}
          />
        )}

        {activeView === 'dashboard' && token && user?.role === 'admin' && (
          <AdminDashboard token={token} />
        )}

        {activeView === 'home' && user && user.role === 'user' && (
          <Home user={user} onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}

export default App;
