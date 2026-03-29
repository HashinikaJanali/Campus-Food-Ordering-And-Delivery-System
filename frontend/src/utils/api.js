import axios from 'axios';

const BACKEND_URL = 'http://localhost:5001';

/**
 * Returns the full URL for a food image.
 * Images are stored as relative paths like `/uploads/food-images/filename.jpg`.
 * This helper prefixes the backend base URL so images always load directly
 * from the backend, regardless of Vite proxy state.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Already a full URL (e.g. http:// or https://)
  if (imagePath.startsWith('http')) return imagePath;
  // Relative path - prepend backend origin
  return `${BACKEND_URL}${imagePath}`;
};


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
    config.url.includes('/register') ||
    config.url.includes('/auth/')
  );

  if (isAuthAction) {
    delete config.headers.Authorization;
    return config;
  }

  // 2. Strict Token Selection
  let token = null;

  // Identify student-only endpoints
  const isStudentOnlyEndpoint = config.url && (
    config.url.includes('/cart') || 
    config.url.includes('/users/') || 
    config.url.includes('/loyalty') ||
    config.url.includes('/reviews')
  );

  if (path.startsWith('/admin')) {
    // We are in the admin panel
    if (isStudentOnlyEndpoint) {
      // Don't send admin token to student endpoints even if we're on an admin page
      token = userToken;
    } else {
      token = adminToken;
      config._isAdminRequest = true;
    }
    
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
  } else {
    // We are on the student side - use user token primarily
    token = userToken;
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback to admin token ONLY for non-sensitive reads if user token is missing
      // but NOT for cart/profile actions
      if (!isStudentOnlyEndpoint && adminToken && adminToken !== 'null' && adminToken !== 'undefined') {
        config.headers.Authorization = `Bearer ${adminToken}`;
      } else {
        delete config.headers.Authorization;
      }
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor - handle auth errors (ADMIN ONLY)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to admin/login if it's an ADMIN endpoint getting 401
    const isAuthError = error.response?.status === 401;
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const isLoginPage = window.location.pathname === '/admin/login';

    if (isAuthError && isAdminPath && !isLoginPage) {
      // Only clear admin session if it was an admin-specific request that failed
      // This prevents student-side sidebars/carts from logging out the admin
      if (error.config?._isAdminRequest) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');

        // Delay redirect slightly to prevent multiple concurrent reloads
        setTimeout(() => {
          if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        }, 100);
      }
    } else if (isAuthError && !isAdminPath) {
      // User side 401
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

export default api;
