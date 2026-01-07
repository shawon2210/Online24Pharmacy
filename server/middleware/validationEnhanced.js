import { body, validationResult } from 'express-validator';

/**
 * Validation middleware to check for errors
 */
export const validateRequest = (req, res, next) => {
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
 * Common validation rules
 */
export const validationRules = {
  email: () => body('email').isEmail().normalizeEmail(),
  password: () => body('password').isLength({ min: 8 }),
  phone: () => body('phone').matches(/^01[3-9]\d{8}$/),
  productId: () => body('productId').isString().notEmpty(),
  quantity: () => body('quantity').isInt({ min: 1 }),
  price: () => body('price').isFloat({ min: 0 }),
};

/**
 * Compose multiple validation rules
 */
export const validate = (...rules) => [
  ...rules,
  validateRequest,
];
