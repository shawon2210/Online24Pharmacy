/**
 * ============================================
 * ERROR HANDLING UTILITIES
 * ============================================
 * 
 * Centralized error handling utilities for consistent
 * error messages and logging across the application
 */

/**
 * Get user-friendly error message from error object
 * Maps technical errors to readable messages
 * 
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Network errors
  if (error.message === 'Failed to fetch' || error.message === 'Network request failed') {
    return 'Network error. Please check your internet connection.';
  }
  
  // Timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return 'Request timeout. Please try again.';
  }
  
  // HTTP status errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return error.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return error.message || 'This item already exists.';
      case 422:
        return error.message || 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        if (error.status >= 500) {
          return 'Server error. Please try again later.';
        }
    }
  }
  
  // Return custom message or default
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Log error with context for debugging
 * 
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
export const logError = (error, context = {}) => {
  const errorLog = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context
  };
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // sendToLoggingService(errorLog);
    console.error('Error:', errorLog.message, errorLog);
  } else {
    console.error('Error:', errorLog);
  }
};

/**
 * Handle API error with logging and user feedback
 * 
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error, context = {}) => {
  logError(error, {
    type: 'API_ERROR',
    ...context
  });
  
  return getErrorMessage(error);
};

/**
 * Validate form data and return errors
 * 
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    // Required check
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = rule.message || `${field} is required`;
      return;
    }
    
    // Min length check
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
      return;
    }
    
    // Max length check
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = rule.message || `${field} must be less than ${rule.maxLength} characters`;
      return;
    }
    
    // Email check
    if (rule.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field] = rule.message || 'Invalid email address';
      return;
    }
    
    // Custom validator
    if (rule.validator && !rule.validator(value)) {
      errors[field] = rule.message || `${field} is invalid`;
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Retry async operation with exponential backoff
 * 
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} Operation result
 */
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

/**
 * Create error object with status and data
 * 
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {Object} data - Additional error data
 * @returns {Error} Enhanced error object
 */
export const createError = (message, status = 500, data = null) => {
  const error = new Error(message);
  error.status = status;
  error.data = data;
  return error;
};

export default {
  getErrorMessage,
  logError,
  handleApiError,
  validateForm,
  retryOperation,
  createError
};
