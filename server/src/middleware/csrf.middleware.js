import crypto from 'crypto';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';
import { getBaseCookieOptions } from '../config/cookies.js';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

const generateCsrfToken = () => crypto.randomBytes(32).toString('hex');

const hashToken = (token) =>
  crypto.createHmac('sha256', env.CSRF_SECRET).update(token).digest('hex');

/**
 * Double-submit cookie CSRF protection.
 * Safe methods receive a CSRF token cookie; state-changing requests must echo it in a header.
 */
const csrfProtection = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  if (safeMethods.includes(req.method)) {
    if (!req.cookies[CSRF_COOKIE_NAME]) {
      const token = generateCsrfToken();
      req.csrfToken = token;
      res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false,
        ...getBaseCookieOptions(),
        maxAge: 24 * 60 * 60 * 1000,
      });
    } else {
      req.csrfToken = req.cookies[CSRF_COOKIE_NAME];
    }
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken) {
    return next(new AppError('CSRF token missing', 403, 'CSRF_ERROR'));
  }

  const cookieHash = hashToken(cookieToken);
  const headerHash = hashToken(headerToken);

  if (
    cookieHash.length !== headerHash.length ||
    !crypto.timingSafeEqual(Buffer.from(cookieHash), Buffer.from(headerHash))
  ) {
    return next(new AppError('Invalid CSRF token', 403, 'CSRF_ERROR'));
  }

  next();
};

export { csrfProtection, CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
