import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import http from '../services/http';
import { login, register as apiRegister } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        const stored = localStorage.getItem('auth_user');
        if (stored) setUser(JSON.parse(stored));
        if (token) {
          // fetch latest user snapshot
          const me = (await http.get('/api/auth/me')).data;
          if (me) {
            localStorage.setItem('auth_user', JSON.stringify(me));
            setUser(me);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const setAuth = (u, token) => {
    if (token) localStorage.setItem('token', token);
    if (u) localStorage.setItem('auth_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, setAuth, logout, login, register: apiRegister, loading }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
