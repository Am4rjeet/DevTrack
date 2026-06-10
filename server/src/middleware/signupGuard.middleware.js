import SignupAttempt from '../models/SignupAttempt.model.js';
import env from '../config/env.js';
import { isTest } from '../config/env.js';
import AppError from '../utils/AppError.js';
import { hashToken } from '../utils/crypto.utils.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const getIpHash = (ip) => hashToken(ip || 'unknown');

const signupGuard = asyncHandler(async (req, _res, next) => {
  if (isTest) return next();

  const ipHash = getIpHash(req.ip);
  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const recentAttempts = await SignupAttempt.countDocuments({
      ipHash,
      createdAt: { $gte: windowStart },
    });

    if (recentAttempts >= env.MAX_SIGNUPS_PER_IP_PER_DAY) {
      logger.warn('Signup IP cap exceeded', { ip: req.ip, requestId: req.requestId });
      throw new AppError(
        'Too many signup attempts. Please try again tomorrow.',
        429,
        'SIGNUP_LIMIT_EXCEEDED'
      );
    }

    await SignupAttempt.create({ ipHash });
    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Signup guard error:', error.message);
    throw new AppError('Service temporarily unavailable', 503, 'SERVICE_UNAVAILABLE');
  }
});

export { signupGuard, getIpHash };
