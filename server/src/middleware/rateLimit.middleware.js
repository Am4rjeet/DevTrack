import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

const rateLimitMessage = (code, message) => ({
  success: false,
  error: { code, message },
});

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests, please try again later'
  ),
});

/** General auth endpoints (refresh, reset password, etc.) */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: rateLimitMessage(
    'AUTH_RATE_LIMIT_EXCEEDED',
    'Too many authentication attempts, please try again later'
  ),
});

/** Strict: max few signups per IP per hour — stops bot floods */
export const registerRateLimiter = rateLimit({
  windowMs: env.REGISTER_RATE_LIMIT_WINDOW_MS,
  max: env.REGISTER_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: rateLimitMessage(
    'REGISTER_RATE_LIMIT_EXCEEDED',
    'Too many signup attempts from this network. Please wait and try again.'
  ),
});

/** Login brute-force protection */
export const loginRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: rateLimitMessage(
    'LOGIN_RATE_LIMIT_EXCEEDED',
    'Too many login attempts. Please wait and try again.'
  ),
});
