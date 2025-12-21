/**
 * ============================================
 * IMPROVED API CLIENT
 * ============================================
 * 
 * Enhanced API client with:
 * - Automatic token refresh
 * - Request/response interceptors
 * - Retry logic
 * - Better error handling
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Token refresh state
 */
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Get authorization headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

/**
 * Refresh access token
 */
const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { accessToken } = await response.json();
    localStorage.setItem('auth_token', accessToken);
    return accessToken;
  } catch (error) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login?redirect=unauthorized';
    throw error;
  }
};

/**
 * Enhanced API request with token refresh
 */
export const apiRequest = async (endpoint, options = {}, retryCount = 0) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    // Handle 401 - Token expired
    if (response.status === 401 && retryCount === 0) {
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const newToken = await refreshAccessToken();
          onRefreshed(newToken);
          isRefreshing = false;
          
          // Retry original request with new token
          return apiRequest(endpoint, options, retryCount + 1);
        } catch (error) {
          isRefreshing = false;
          throw error;
        }
      }
      
      // Wait for token refresh to complete
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((token) => {
          apiRequest(endpoint, options, retryCount + 1)
            .then(resolve)
            .catch(reject);
        });
      });
    }

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.error || data.message || 'Request failed',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network error
    throw new APIError(
      error.message || 'Network error',
      0,
      null
    );
  }
};

/**
 * Upload file with progress tracking
 */
export const uploadFile = async (endpoint, formData, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const token = localStorage.getItem('auth_token');

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (error) {
          reject(new APIError('Invalid response', xhr.status, null));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new APIError(data.error || 'Upload failed', xhr.status, data));
        } catch (error) {
          reject(new APIError('Upload failed', xhr.status, null));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new APIError('Network error', 0, null));
    });

    xhr.open('POST', `${API_URL}${endpoint}`);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
  });
};

/**
 * API request with retry logic
 */
export const apiRequestWithRetry = async (
  endpoint,
  options = {},
  maxRetries = 3,
  retryDelay = 1000
) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiRequest(endpoint, options);
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError;
};

/**
 * Batch API requests
 */
export const batchRequests = async (requests) => {
  try {
    const results = await Promise.allSettled(requests);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { success: true, data: result.value, index };
      } else {
        return { success: false, error: result.reason, index };
      }
    });
  } catch (error) {
    throw new APIError('Batch request failed', 0, null);
  }
};

export default {
  apiRequest,
  uploadFile,
  apiRequestWithRetry,
  batchRequests,
  APIError
};
