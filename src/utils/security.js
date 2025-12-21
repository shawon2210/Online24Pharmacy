/**
 * Frontend security utilities
 */

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = (html) => {
  if (!html) return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Validate and sanitize user input
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} Is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/**
 * Securely store token in localStorage
 * @param {string} token - JWT token
 */
export const storeToken = (token) => {
  if (!token) return;
  
  try {
    localStorage.setItem('auth_token', token);
    
    // Set expiry reminder
    const payload = JSON.parse(atob(token.split('.')[1]));
    localStorage.setItem('token_expiry', payload.exp);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

/**
 * Get token from localStorage
 * @returns {string|null} Token or null
 */
export const getToken = () => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (token && isTokenExpired(token)) {
      clearToken();
      return null;
    }
    
    return token;
  } catch {
    return null;
  }
};

/**
 * Clear token from localStorage
 */
export const clearToken = () => {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiry');
  } catch (error) {
    console.error('Failed to clear token:', error);
  }
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
  } = options;
  
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${maxSize / 1024 / 1024}MB`
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be ${allowedTypes.join(', ')}`
    };
  }
  
  return { valid: true };
};

/**
 * Generate CSRF token
 * @returns {string} CSRF token
 */
export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Mask sensitive data for display
 * @param {string} data - Data to mask
 * @param {number} visibleChars - Number of visible characters
 * @returns {string} Masked data
 */
export const maskSensitiveData = (data, visibleChars = 4) => {
  if (!data || data.length <= visibleChars) return data;
  
  const visible = data.slice(-visibleChars);
  const masked = '*'.repeat(data.length - visibleChars);
  return masked + visible;
};

export default {
  sanitizeHTML,
  sanitizeInput,
  isTokenExpired,
  storeToken,
  getToken,
  clearToken,
  validateFile,
  generateCSRFToken,
  maskSensitiveData
};
