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

// Response interceptor - handle auth errors (ADMIN ONLY)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to admin/login if it's an ADMIN endpoint getting 401
    // or if it was specifically an admin-session request
    if (error.response?.status === 401) {
      if (error.config?._isAdminRequest || (window.location.pathname.startsWith('/admin') && !error.config.url.includes('/users/'))) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');

        // Use a slight delay to allow the current app state to settle before reload
        setTimeout(() => {
          if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        }, 50);
      } else {
        // User side 401
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
