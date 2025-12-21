/**
 * Input validation middleware
 */

import { body, param, query, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[<>]/g, '')
    .trim();
};

/**
 * Validation rules for user registration
 */
export const validateRegistration = [
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain lowercase letter')
    .matches(/\d/).withMessage('Password must contain number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .customSanitizer(sanitizeInput),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .customSanitizer(sanitizeInput),
  body('phone')
    .optional()
    .matches(/^01[3-9]\d{8}$/).withMessage('Invalid phone number. Must be 11 digits and start with 01 (e.g., 01712345678)'),
  handleValidationErrors
];

/**
 * Validation rules for login
 */
export const validateLogin = [
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Validation rules for product creation
 */
export const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Name must be 3-200 characters')
    .customSanitizer(sanitizeInput),
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('stockQuantity')
    .isInt({ min: 0 }).withMessage('Stock must be non-negative'),
  body('categoryId')
    .isInt().withMessage('Invalid category ID'),
  handleValidationErrors
];

/**
 * Validation rules for order creation
 */
export const validateOrder = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.productId')
    .isInt().withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress')
    .notEmpty().withMessage('Shipping address is required')
    .customSanitizer(sanitizeInput),
  body('paymentMethod')
    .isIn(['COD', 'CARD', 'BKASH', 'NAGAD']).withMessage('Invalid payment method'),
  handleValidationErrors
];

/**
 * Validation rules for prescription upload
 */
export const validatePrescription = [
  body('patientName')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Patient name must be 2-100 characters')
    .customSanitizer(sanitizeInput),
  body('doctorName')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Doctor name must be 2-100 characters')
    .customSanitizer(sanitizeInput),
  body('medication')
    .trim()
    .notEmpty().withMessage('Medication is required')
    .customSanitizer(sanitizeInput),
  handleValidationErrors
];

/**
 * Validation rules for ID parameters
 */
export const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID'),
  handleValidationErrors
];

/**
 * Validation rules for pagination
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be positive'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  handleValidationErrors
];

export default {
  validateRegistration,
  validateLogin,
  validateProduct,
  validateOrder,
  validatePrescription,
  validateId,
  validatePagination,
  handleValidationErrors
};
