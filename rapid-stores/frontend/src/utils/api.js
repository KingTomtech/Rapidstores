export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Product APIs
export const getProducts = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return fetchAPI(`/api/products${queryString ? `?${queryString}` : ''}`);
};

export const getProduct = (id) => fetchAPI(`/api/products/${id}`);

export const getCategories = () => fetchAPI('/api/products/categories');

// Auth APIs
export const register = (data) => fetchAPI('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const login = (data) => fetchAPI('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return fetchAPI('/api/auth/logout', { method: 'POST' });
};

// Cart APIs
export const getCart = () => fetchAPI('/api/cart');

export const addToCart = (productId, quantity = 1) =>
  fetchAPI('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  });

export const updateCartItem = (itemId, quantity) =>
  fetchAPI(`/api/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });

export const removeFromCart = (itemId) =>
  fetchAPI(`/api/cart/items/${itemId}`, { method: 'DELETE' });

// Order APIs
export const createOrder = (data) =>
  fetchAPI('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getOrders = () => fetchAPI('/api/orders');

export const getOrder = (id) => fetchAPI(`/api/orders/${id}`);

export const createWhatsAppOrder = (data) =>
  fetchAPI('/api/orders/whatsapp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Voucher APIs
export const validateVoucher = (code, orderAmount) =>
  fetchAPI('/api/vouchers/validate', {
    method: 'POST',
    body: JSON.stringify({ code, order_amount: orderAmount }),
  });

// Admin APIs
export const getAdminOrders = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return fetchAPI(`/api/admin/orders${queryString ? `?${queryString}` : ''}`);
};

export const updateOrderStatus = (id, data) =>
  fetchAPI(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const getAdminStats = () => fetchAPI('/api/admin/stats');

export const getSalesAnalytics = (days = 30) =>
  fetchAPI(`/api/admin/analytics/sales?days=${days}`);

export const createProduct = (data) =>
  fetchAPI('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateProduct = (id, data) =>
  fetchAPI(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteProduct = (id) =>
  fetchAPI(`/api/admin/products/${id}`, { method: 'DELETE' });

export const getVouchers = () => fetchAPI('/api/admin/vouchers');

export const createVoucher = (data) =>
  fetchAPI('/api/admin/vouchers', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// AI APIs
export const chatWithAI = (message, context = {}) =>
  fetchAPI('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, context }),
  });

export const getRecommendations = (cartItems, viewedProducts) =>
  fetchAPI('/api/ai/recommendations', {
    method: 'POST',
    body: JSON.stringify({ cart_items: cartItems, viewed_products: viewedProducts }),
  });

export const getInventoryAlerts = () => fetchAPI('/api/ai/inventory-alerts');

export const generateMarketingContent = (type, products, goal) =>
  fetchAPI('/api/ai/marketing-content', {
    method: 'POST',
    body: JSON.stringify({ type, products, campaign_goal: goal }),
  });
