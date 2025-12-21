/**
 * Image optimization utilities
 */

/**
 * Generate optimized image URL with size parameters
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options;

  if (!url) return '';
  
  // If external URL, return as is
  if (url.startsWith('http')) return url;
  
  // For local images, add optimization params
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const params = new URLSearchParams();
  
  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality) params.append('q', quality);
  if (format) params.append('f', format);
  
  const queryString = params.toString();
  return `${API_URL}${url}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Preload critical images
 * @param {string[]} urls - Array of image URLs
 */
export const preloadImages = (urls) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Lazy load images with Intersection Observer
 * @param {HTMLElement} element - Image element
 * @param {string} src - Image source
 */
export const lazyLoadImage = (element, src) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        element.src = src;
        observer.unobserve(element);
      }
    });
  });
  
  observer.observe(element);
};

/**
 * Generate responsive image srcset
 * @param {string} url - Base image URL
 * @param {number[]} sizes - Array of widths
 * @returns {string} srcset string
 */
export const generateSrcSet = (url, sizes = [320, 640, 960, 1280]) => {
  return sizes
    .map(size => `${getOptimizedImageUrl(url, { width: size })} ${size}w`)
    .join(', ');
};

export default {
  getOptimizedImageUrl,
  preloadImages,
  lazyLoadImage,
  generateSrcSet
};
