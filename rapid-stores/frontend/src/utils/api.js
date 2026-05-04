import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data)
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: (threshold) => api.get(`/products/admin/low-stock?threshold=${threshold}`)
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getAllAdmin: (params) => api.get('/orders/admin/all', { params }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  updatePayment: (id, payment_status) => api.put(`/orders/${id}/payment`, { payment_status }),
  getSalesAnalytics: (days) => api.get(`/orders/admin/analytics/sales?days=${days}`),
  getBestSelling: (limit) => api.get(`/orders/admin/analytics/products?limit=${limit}`),
  getStats: () => api.get('/orders/admin/stats'),
  validateVoucher: (code, amount) => api.post('/orders/validate-voucher', { code, amount })
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/items', data),
  update: (product_id, quantity) => api.put(`/cart/items/${product_id}`, { quantity }),
  remove: (product_id) => api.delete(`/cart/items/${product_id}`),
  clear: () => api.delete('/cart')
};

// Vouchers API
export const vouchersAPI = {
  getAll: () => api.get('/vouchers'),
  create: (data) => api.post('/vouchers', data),
  toggle: (id) => api.put(`/vouchers/${id}/toggle`),
  delete: (id) => api.delete(`/vouchers/${id}`)
};

// AI API
export const aiAPI = {
  chat: (message, context) => api.post('/ai/chat', { message, context }),
  recommend: (cart_items, category) => api.post('/ai/recommend', { cart_items, category }),
  inventory: () => api.post('/ai/inventory'),
  marketing: (type, products) => api.post('/ai/marketing', { type, products })
};

// WhatsApp Order API
export const whatsappOrderAPI = (data) => api.post('/orders/whatsapp', data);

export default api;
