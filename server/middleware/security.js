/**
 * Security middleware
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Prevent SQL injection in query parameters
 */
export const sanitizeQuery = (req, res, next) => {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          return false;
        }
      }
    }
    return true;
  };

  // Check query parameters
  for (const key in req.query) {
    if (!checkValue(req.query[key])) {
      return res.status(400).json({ error: 'Invalid input detected' });
    }
  }

  // Check body parameters
  const checkObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (!checkObject(obj[key])) return false;
      } else if (!checkValue(obj[key])) {
        return false;
      }
    }
    return true;
  };

  if (req.body && !checkObject(req.body)) {
    return res.status(400).json({ error: 'Invalid input detected' });
  }

  next();
};

/**
 * Add security headers
 */
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};

/**
 * Log security events
 */
export const logSecurityEvent = (userId, event, details, ipAddress) => {
  console.log('[SECURITY]', {
    timestamp: new Date().toISOString(),
    userId,
    event,
    details,
    ipAddress
  });
};

export default {
  authLimiter,
  apiLimiter,
  sanitizeQuery,
  securityHeaders,
  logSecurityEvent
};
