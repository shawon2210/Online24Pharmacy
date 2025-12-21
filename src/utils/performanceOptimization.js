/**
 * Performance optimization utilities for faster page loads
 */

/**
 * Preload critical images
 */
export const preloadImages = (imageUrls) => {
  if (typeof window === 'undefined') return;
  
  imageUrls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImage = (img) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove('lazy');
          observer.unobserve(lazyImage);
        }
      });
    });
    observer.observe(img);
  } else {
    img.src = img.dataset.src;
  }
};

/**
 * Debounce function for scroll/resize events
 */
export const debounce = (func, wait = 100) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for high-frequency events
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if element is in viewport
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

/**
 * Prefetch route data
 */
export const prefetchRoute = (url) => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
};

/**
 * DNS prefetch for external domains
 */
export const dnsPrefetch = (domain) => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;
  document.head.appendChild(link);
};

/**
 * Preconnect to external domains
 */
export const preconnect = (domain) => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName, callback) => {
  if (typeof window === 'undefined' || !window.performance) return callback();
  
  const startTime = performance.now();
  const result = callback();
  const endTime = performance.now();
  
  console.log(`${componentName} render time: ${(endTime - startTime).toFixed(2)}ms`);
  
  return result;
};

/**
 * Request idle callback wrapper
 */
export const requestIdleCallback = (callback) => {
  if (typeof window === 'undefined') return;
  
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
};

/**
 * Optimize images by adding loading and decoding attributes
 */
export const optimizeImageAttributes = (img, priority = false) => {
  if (priority) {
    img.loading = 'eager';
    img.fetchPriority = 'high';
  } else {
    img.loading = 'lazy';
    img.decoding = 'async';
  }
  return img;
};
