import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    if (token && user) {
      setAdmin(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token, admin } = res.data;
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(admin));
    setAdmin(admin);
    return admin;
  };

  const register = async (name, email, password, role = "admin") => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token, admin } = res.data;
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(admin));
    setAdmin(admin);
    return admin;
  };

  const logout = (shouldRedirect = true) => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
    if (shouldRedirect && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const updateCredentials = async ({ username, currentPassword, newPassword }) => {
    const res = await api.put('/auth/credentials', { username, currentPassword, newPassword });
    const updatedAdmin = res.data.admin;
    localStorage.setItem('admin_user', JSON.stringify(updatedAdmin));
    setAdmin(updatedAdmin);
    return updatedAdmin;
  };

  return (
    <AuthContext.Provider value={{ admin, login, register, logout, updateCredentials, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
