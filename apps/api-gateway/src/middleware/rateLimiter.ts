import { rateLimit } from 'express-rate-limit';

/**
 * General rate limiter for all routes.
 * 100 requests per 15-minute window per IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again after 15 minutes',
        correlationId: req.correlationId,
      },
    });
  },
});

/**
 * Stricter rate limiter for authentication routes (/user/register, /user/login).
 * 20 requests per 15-minute window per IP to mitigate credential stuffing
 * and registration abuse.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again after 15 minutes',
        correlationId: req.correlationId,
      },
    });
  },
});
