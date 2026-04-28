import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('ip_admin') || 'null'); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // On boot, if we have a token, validate it by calling /me.
  useEffect(() => {
    const tok = localStorage.getItem('ip_token');
    if (!tok) { setLoading(false); return; }
    api.get('/auth/me')
      .then(r => {
        setAdmin(r.data.admin);
        localStorage.setItem('ip_admin', JSON.stringify(r.data.admin));
      })
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('ip_token', r.data.token);
    localStorage.setItem('ip_admin', JSON.stringify(r.data.admin));
    setAdmin(r.data.admin);
    return r.data.admin;
  }

  function logout() {
    localStorage.removeItem('ip_token');
    localStorage.removeItem('ip_admin');
    setAdmin(null);
  }

  return (
    <AuthCtx.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
