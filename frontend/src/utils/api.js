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
    // Only redirect to admin/login if it's an ADMIN endpoint getting 401
    if (error.response?.status === 401 && !error.config.url.includes('/users/')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
