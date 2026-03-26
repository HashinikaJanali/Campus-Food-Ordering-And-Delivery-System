import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle auth errors (ADMIN ONLY)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect when currently in admin area and receiving unauthorized.
    const isAdminArea = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/admin-panel');
    if (error.response?.status === 401 && isAdminArea) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
