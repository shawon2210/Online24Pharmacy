/**
 * Centralized API client with error handling and token management
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get authorization headers with token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  // SSRF protection: ensure endpoint is a strict relative path (no protocol, no domain, no double slashes, no path traversal)
  if (
    typeof endpoint !== 'string' ||
    !endpoint.startsWith('/') ||
    endpoint.includes('://') ||
    endpoint.startsWith('//') ||
    endpoint.includes('\\') ||
    endpoint.includes('..')
  ) {
    throw new Error('Invalid endpoint');
  }
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

/**
 * Upload file with multipart/form-data
 * @param {string} endpoint - API endpoint path
 * @param {FormData} formData - Form data with file
 * @returns {Promise<Object>} Response data
 */
export const uploadFile = async (endpoint, formData) => {
  if (!endpoint.startsWith('/')) {
    throw new Error('Invalid endpoint');
  }
  const token = localStorage.getItem('auth_token');
  
  try {
    // SSRF protection: ensure endpoint is a strict relative path (no protocol, no domain, no double slashes)
    if (
      typeof endpoint !== 'string' ||
      !endpoint.startsWith('/') ||
      endpoint.includes('://') ||
      endpoint.startsWith('//') ||
      endpoint.includes('\\') ||
      endpoint.includes('..')
    ) {
      throw new Error('Invalid endpoint for upload');
    }
    // CSRF protection: always include CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    const headers = { 'Authorization': `Bearer ${token}` };
    headers['X-CSRF-Token'] = csrfToken;
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  } catch (error) {
    console.error(`Upload Error [${endpoint}]:`, error);
    throw error;
  }
};

// Prescription API
export const prescriptionApi = {
  getAll: () => apiRequest('/api/prescriptions'),
  create: (data) => apiRequest('/api/prescriptions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  upload: (file) => {
    const formData = new FormData();
    formData.append('prescription', file);
    return uploadFile('/api/prescriptions/upload', formData);
  },
  reorder: (id) => {
    if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid id');
    return apiRequest(`/api/prescriptions/${id}/reorder`, { method: 'POST' });
  },
  setReminder: (id) => {
    if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid id');
    return apiRequest(`/api/prescriptions/${id}/reminder`, { method: 'POST' });
  }
};

// Product API
export const productApi = {
  getAll: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/products${query ? `?${query}` : ''}`);
  },
  getById: (id) => {
    if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid id');
    return apiRequest(`/api/products/${id}`);
  },
  search: (query) => apiRequest(`/api/products/search?q=${encodeURIComponent(query)}`)
};

// Order API
export const orderApi = {
  getAll: () => apiRequest('/api/orders'),
  getById: (id) => apiRequest(`/api/orders/${id}`),
  create: (data) => apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Auth API
export const authApi = {
  login: (email, password) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  signup: (userData) => apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  logout: () => apiRequest('/api/auth/logout', {
    method: 'POST'
  }),
  refreshToken: () => apiRequest('/api/auth/refresh', {
    method: 'POST'
  })
};

// Cart API
export const cartApi = {
  get: () => apiRequest('/api/cart'),
  add: (productId, quantity) => {
    if (!Number.isInteger(productId) || productId <= 0) throw new Error('Invalid productId');
    return apiRequest('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
      headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' }
    });
  },
  remove: (productId) => {
    if (!Number.isInteger(productId) || productId <= 0) throw new Error('Invalid productId');
    return apiRequest(`/api/cart/${productId}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' }
    });
  },
  clear: () => apiRequest('/api/cart', {
    method: 'DELETE'
  })
};

export default {
  authApi,
  prescriptionApi,
  productApi,
  orderApi,
  cartApi
};
