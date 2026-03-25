import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Request interceptor - strictly separate admin and user context
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token');
  const userToken = localStorage.getItem('user_token');
  const path = window.location.pathname;

  // 1. Auth routes safety - never send tokens to login/register
  const isAuthAction = config.url && (
    config.url.includes('/login') || 
    config.url.includes('/register')
  );

  if (isAuthAction) {
    delete config.headers.Authorization;
    return config;
  }

  // 2. Strict Token Selection
  let token = null;

  if (path.startsWith('/admin')) {
    // We are in the admin panel - use admin token ONLY
    token = adminToken;
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
      config._isAdminRequest = true;
    } else {
      // If no admin token but on admin page, don't fallback to user token
      delete config.headers.Authorization;
    }
  } else {
    // We are on the student side - use user token primarily
    token = userToken || adminToken;
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor - handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const is401 = error.response?.status === 401;
    const isLoginPage = window.location.pathname === '/admin/login';
    
    // Only redirect to login if:
    // 1. It's a 401 error
    // 2. We're NOT on the login page
    // 3. The request was specifically an admin-session request
    if (is401 && !isLoginPage && error.config?._isAdminRequest) {
// Response interceptor - handle auth errors (ADMIN ONLY)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to admin/login if it's an ADMIN endpoint getting 401
    if (error.response?.status === 401 && !error.config.url.includes('/users/')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      
      // Use a slight delay to allow the current app state to settle before reload
      setTimeout(() => {
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }, 50);
    }
    return Promise.reject(error);
  }
);

export default api;
