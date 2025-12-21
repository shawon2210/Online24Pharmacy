/**
 * Date formatting and manipulation utilities
 */

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale (default: 'en-US')
 * @returns {string} Formatted date
 */
export const formatDate = (date, locale = 'en-US') => {
  if (!date) return '';
  
  return new Date(date).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date
 * @returns {string} Relative time
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Check if date is expired
 * @param {string|Date} date - Date to check
 * @param {number} validityMonths - Validity period in months
 * @returns {boolean} Is expired
 */
export const isExpired = (date, validityMonths = 6) => {
  if (!date) return true;
  
  const expiryDate = new Date(date);
  expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
  
  return new Date() > expiryDate;
};

/**
 * Get days until expiry
 * @param {string|Date} date - Date
 * @param {number} validityMonths - Validity period in months
 * @returns {number} Days until expiry (negative if expired)
 */
export const getDaysUntilExpiry = (date, validityMonths = 6) => {
  if (!date) return -1;
  
  const expiryDate = new Date(date);
  expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
  
  const diffMs = expiryDate - new Date();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export default {
  formatDate,
  formatDateTime,
  getRelativeTime,
  isExpired,
  getDaysUntilExpiry
};
