import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('fetchProducts error:', error);
    return { products: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
  }
};

export const fetchCategories = async () => {
  const response = await api.get('/products/categories/all');
  return response.data;
};

export const fetchProduct = async (slug) => {
  const response = await api.get(`/products/${slug}`);
  return response.data;
};

export const fetchProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

export const addReview = async (payload) => {
  const response = await api.post('/reviews', payload);
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await api.post('/wishlist/add', { productId });
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/remove/${productId}`);
  return response.data;
};

export const fetchCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.put(`/cart/update/${itemId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (itemId) => {
  const response = await api.delete(`/cart/remove/${itemId}`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const fetchOrder = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// Admin / internal helpers
export const fetchInventory = async () => {
  const response = await api.get('/admin/inventory');
  return response.data;
};

export const updateInventory = async (updatePayload) => {
  const response = await api.put('/admin/inventory', updatePayload);
  return response.data;
};

export const fetchAdminProducts = async () => {
  const response = await api.get('/admin/products');
  return response.data;
};

export const fetchAdminOrders = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};

export const fetchAdminPrescriptions = async (status) => {
  const response = await api.get(`/admin/prescriptions${status ? `?status=${status}` : ''}`);
  return response.data;
};

export const reviewPrescription = async (payload) => {
  const response = await api.post('/admin/prescriptions/review', payload);
  return response.data;
};

export const fetchPromotions = async () => {
  const response = await api.get('/admin/promotions');
  return response.data;
};

export const createPromotion = async (payload) => {
  const response = await api.post('/admin/promotions', payload);
  return response.data;
};

export const fetchAdminCustomers = async () => {
  const response = await api.get('/admin/customers');
  return response.data;
};

export const fetchAnalytics = async () => {
  const response = await api.get('/admin/analytics');
  return response.data;
};

export const fetchSuppliers = async () => {
  const response = await api.get('/admin/suppliers');
  return response.data;
};

export const addSupplier = async (payload) => {
  const response = await api.post('/admin/suppliers', payload);
  return response.data;
};

export const updateSupplier = async (payload) => {
  const response = await api.put(`/admin/suppliers/${payload.id}`, payload);
  return response.data;
};

// Auth
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
}

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
}

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
}

export default api;
