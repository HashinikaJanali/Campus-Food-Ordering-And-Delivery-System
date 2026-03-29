import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const userData = localStorage.getItem('user_data');
    if (token && token !== 'null' && token !== 'undefined' && 
        userData && userData !== 'null' && userData !== 'undefined') {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Failed to parse user data from localStorage');
      }
    }
    setLoading(false);
  }, []);

  const setLoginRedirect = (path) => {
    localStorage.setItem('login_redirect', path);
    setRedirectTo(path);
  };

  const getLoginRedirect = () => {
    const path = localStorage.getItem('login_redirect');
    if (path) {
      localStorage.removeItem('login_redirect');
    }
    return path || '/';
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/users/login', { email, password });
      const { data } = res.data;
      localStorage.setItem('user_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data));
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
      setUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
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
      isAuthenticated: !!user,
      setLoginRedirect,
      getLoginRedirect
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
