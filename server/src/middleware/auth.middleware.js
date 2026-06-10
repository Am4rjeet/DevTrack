import AppError from '../utils/AppError.js';
import env from '../config/env.js';
import { verifyAccessToken } from '../utils/token.utils.js';
import { ACCESS_TOKEN_COOKIE } from '../config/cookies.js';
import userRepository from '../repositories/user.repository.js';

const extractAccessToken = (req) => {
  if (req.cookies?.[ACCESS_TOKEN_COOKIE]) {
    return req.cookies[ACCESS_TOKEN_COOKIE];
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
};

const authenticate = async (req, _res, next) => {
  try {
    const token = extractAccessToken(req);
    if (!token) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.sub);

    if (!user) {
      throw new AppError('User not found', 401, 'UNAUTHORIZED');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuthenticate = async (req, _res, next) => {
  try {
    const token = extractAccessToken(req);
    if (!token) return next();

    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.sub);

    if (user) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      };
    }

    next();
  } catch {
    next();
  }
};

const requireEmailVerified = (req, _res, next) => {
  if (!env.REQUIRE_EMAIL_VERIFICATION) return next();

  if (!req.user?.isEmailVerified) {
    return next(new AppError('Email verification required', 403, 'EMAIL_NOT_VERIFIED'));
  }
  next();
};

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
  }
  next();
};

export { authenticate, optionalAuthenticate, requireEmailVerified, requireRole };
