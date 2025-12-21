/**
 * Order-related business logic utilities
 */

import { ORDER_STATUS } from './constants';

/**
 * Calculate order totals
 * @param {Array} items - Cart items
 * @param {number} shippingCost - Shipping cost
 * @returns {Object} Order totals
 */
export const calculateOrderTotals = (items, shippingCost = 0) => {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const total = subtotal + shippingCost;

  return { subtotal, shippingCost, total };
};

/**
 * Get order status metadata
 * @param {string} status - Order status
 * @returns {Object} Status metadata
 */
export const getOrderStatusMeta = (status) => {
  const statusMap = {
    [ORDER_STATUS.PENDING]: {
      label: 'Pending',
      color: 'amber',
      icon: 'clock'
    },
    [ORDER_STATUS.CONFIRMED]: {
      label: 'Confirmed',
      color: 'blue',
      icon: 'check'
    },
    [ORDER_STATUS.PROCESSING]: {
      label: 'Processing',
      color: 'blue',
      icon: 'truck'
    },
    [ORDER_STATUS.SHIPPED]: {
      label: 'Shipped',
      color: 'purple',
      icon: 'truck'
    },
    [ORDER_STATUS.DELIVERED]: {
      label: 'Delivered',
      color: 'emerald',
      icon: 'check-circle'
    },
    [ORDER_STATUS.CANCELLED]: {
      label: 'Cancelled',
      color: 'red',
      icon: 'x'
    }
  };

  return statusMap[status] || statusMap[ORDER_STATUS.PENDING];
};

/**
 * Format order number for display
 * @param {string} orderNumber - Order number
 * @returns {string} Formatted order number
 */
export const formatOrderNumber = (orderNumber) => {
  return orderNumber?.startsWith('#') ? orderNumber : `#${orderNumber}`;
};

/**
 * Check if order can be cancelled
 * @param {string} status - Order status
 * @returns {boolean} Can cancel
 */
export const canCancelOrder = (status) => {
  return [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(status);
};

/**
 * Check if order requires prescription
 * @param {Array} items - Order items
 * @returns {boolean} Requires prescription
 */
export const orderRequiresPrescription = (items) => {
  return items.some(item => item.product?.requiresPrescription);
};

export default {
  calculateOrderTotals,
  getOrderStatusMeta,
  formatOrderNumber,
  canCancelOrder,
  orderRequiresPrescription
};
