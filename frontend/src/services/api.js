import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Review API
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getAll: (params) => api.get('/reviews', { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getSummary: () => api.get('/reviews/summary'),
  markHelpful: (id) => api.patch(`/reviews/${id}/helpful`),
};

// Loyalty API
export const loyaltyAPI = {
  create: (data) => api.post('/loyalty/create', data),
  get: (userId) => api.get(`/loyalty/${userId}`),
  addPoints: (data) => api.post('/loyalty/add-points', data),
  redeem: (data) => api.post('/loyalty/redeem', data),
  getHistory: (userId) => api.get(`/loyalty/${userId}/history`),
  getLeaderboard: (limit) => api.get('/loyalty/leaderboard/top', { params: { limit } }),
};

// Order API
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export default api;