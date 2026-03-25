import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      setUser(JSON.parse(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/users/login', { email, password });
      const { data } = res.data;
      localStorage.setItem('user_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data));
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/users/register', { name, email, password });
      const { data } = res.data;
      localStorage.setItem('user_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data));
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const res = await api.put('/users/profile', userData);
      const updatedUser = res.data.data;
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <UserAuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      loading,
      isAuthenticated: !!user
    }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};
