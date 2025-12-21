/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate Bangladesh phone number
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid
 */
export const isValidPhone = (phone) => {
  return /^01[3-9]\d{8}$/.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return {
    isValid: minLength && hasUpper && hasLower && hasNumber,
    minLength,
    hasUpper,
    hasLower,
    hasNumber
  };
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Allowed MIME types
 * @returns {boolean} Is valid
 */
export const isValidFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} Is valid
 */
export const isValidFileSize = (file, maxSizeMB = 5) => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

export default {
  isValidEmail,
  isValidPhone,
  validatePassword,
  isValidFileType,
  isValidFileSize
};
