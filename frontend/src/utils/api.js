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

// Admin specific path prefixes
const adminPaths = ['/admin', '/orders', '/order/', '/tracking', '/history'];

const isAdminContext = () => {
  const path = window.location.pathname;
  return adminPaths.some(p => path.startsWith(p));
};

// Request interceptor - dynamically add correct auth token
api.interceptors.request.use((config) => {
  if (isAdminContext()) {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else {
    const userToken = localStorage.getItem('user_token');
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
  }
  return config;
});

// Response interceptor - handle auth errors based on context
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (isAdminContext()) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        // Do not redirect forcefully if not needed, or redirect to user login
        // Removed aggressive user redirect to avoid disrupting guest carts
      }
    }
    return Promise.reject(error);
  }
);

export default api;
