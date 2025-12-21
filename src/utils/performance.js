/**
 * Performance optimization utilities
 */

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Measure component render time
 * @param {string} componentName - Name of component
 * @param {Function} callback - Callback function
 */
export const measureRenderTime = (componentName, callback) => {
  const start = performance.now();
  callback();
  const end = performance.now();
  console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
};

/**
 * Batch state updates
 * @param {Function[]} updates - Array of state update functions
 */
export const batchUpdates = (updates) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

/**
 * Memoize expensive calculations
 * @param {Function} fn - Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Virtual scroll helper
 * @param {Array} items - All items
 * @param {number} containerHeight - Container height
 * @param {number} itemHeight - Individual item height
 * @param {number} scrollTop - Current scroll position
 * @returns {Object} Visible items and offsets
 */
export const getVisibleItems = (items, containerHeight, itemHeight, scrollTop) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
  
  return {
    visibleItems: items.slice(startIndex, endIndex),
    offsetY: startIndex * itemHeight,
    totalHeight: items.length * itemHeight
  };
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Is in viewport
 */
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export default {
  throttle,
  debounce,
  measureRenderTime,
  batchUpdates,
  memoize,
  getVisibleItems,
  isInViewport
};
