/**
 * Application constants
 */

// Routes
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/product/:slug',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PRESCRIPTION: '/prescription',
  MY_ORDERS: '/my-orders',
  TRACK_ORDER: '/track-order',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ABOUT: '/about',
  CONTACT: '/contact'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  PHARMACIST: 'PHARMACIST',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER'
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100
};

// Breakpoints (Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// Delivery
export const DELIVERY = {
  FREE_DELIVERY_THRESHOLD: 500,
  STANDARD_DELIVERY_FEE: 50,
  EXPRESS_DELIVERY_FEE: 100
};

// Prescription
export const PRESCRIPTION = {
  MAX_FILES: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};

export default {
  ROUTES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  USER_ROLES,
  FILE_UPLOAD,
  PAGINATION,
  BREAKPOINTS
};
