import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Request interceptor - choose the right token based on context
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token');
  const userToken = localStorage.getItem('user_token');
  const path = window.location.pathname;

  // Decision logic:
  // 1. If we are browsing an /admin/ page, prioritize the admin token.
  // 2. If we are on the student side (/), prioritize the user token.
  // 3. This ensures that an administrator can still shop as a student if they have both.
  let token = null;

  if (path.startsWith('/admin')) {
    token = adminToken || userToken;
  } else {
    token = userToken || adminToken;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor - handle session expiration and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If a 401 occurs while on an admin page, redirect to the admin login
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
