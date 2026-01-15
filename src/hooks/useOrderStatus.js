import { useMemo } from 'react';
import {
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ORDER_STATUS } from '../utils/constants';

/**
 * Centralized order status configuration
 * This provides a single source of truth for order status icons, colors, and labels
 */
export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: {
    icon: ClockIcon,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    borderColor: 'border-amber-300 dark:border-amber-700',
  },
  [ORDER_STATUS.CONFIRMED]: {
    icon: CheckCircleIcon,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
  },
  [ORDER_STATUS.PROCESSING]: {
    icon: TruckIcon,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
  },
  [ORDER_STATUS.SHIPPED]: {
    icon: TruckIcon,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    borderColor: 'border-purple-300 dark:border-purple-700',
  },
  [ORDER_STATUS.DELIVERED]: {
    icon: CheckCircleIcon,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
  },
  [ORDER_STATUS.CANCELLED]: {
    icon: XMarkIcon,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/30',
    borderColor: 'border-red-300 dark:border-red-700',
  },
};

/**
 * Tracking page status steps configuration
 * These are ordered steps for the order tracking timeline
 */
export const ORDER_TRACKING_STEPS = [
  { key: ORDER_STATUS.PENDING, labelKey: 'orderTrackingPage.orderPlaced' },
  { key: ORDER_STATUS.CONFIRMED, labelKey: 'orderTrackingPage.confirmed' },
  { key: ORDER_STATUS.PROCESSING, labelKey: 'orderTrackingPage.processing' },
  { key: ORDER_STATUS.SHIPPED, labelKey: 'orderTrackingPage.shipped' },
  { key: ORDER_STATUS.DELIVERED, labelKey: 'orderTrackingPage.delivered' },
];

/**
 * Hook to get order status metadata with translations
 * @param {string} status - The order status
 * @param {object} t - Translation function
 * @returns {object} Status metadata including icon, colors, and translated label
 */
export function useOrderStatus(status, t) {
  return useMemo(() => {
    const config = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG[ORDER_STATUS.PENDING];
    
    // Get translated label
    const labelMap = {
      [ORDER_STATUS.PENDING]: t('ordersPage.status.pending'),
      [ORDER_STATUS.CONFIRMED]: t('ordersPage.status.confirmed'),
      [ORDER_STATUS.PROCESSING]: t('ordersPage.status.processing'),
      [ORDER_STATUS.SHIPPED]: t('ordersPage.status.shipped'),
      [ORDER_STATUS.DELIVERED]: t('ordersPage.status.delivered'),
      [ORDER_STATUS.CANCELLED]: t('ordersPage.status.cancelled'),
    };
    
    return {
      ...config,
      label: labelMap[status] || labelMap[ORDER_STATUS.PENDING],
    };
  }, [status, t]);
}

/**
 * Get tracking step index for a given order status
 * @param {string} status - The order status
 * @returns {number} Index of the step (0-based)
 */
export function getTrackingStepIndex(status) {
  const index = ORDER_TRACKING_STEPS.findIndex(step => step.key === status);
  return index >= 0 ? index : 0;
}

export default {
  ORDER_STATUS_CONFIG,
  ORDER_TRACKING_STEPS,
  useOrderStatus,
  getTrackingStepIndex,
};

