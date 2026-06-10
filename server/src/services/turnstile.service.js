import env, { isProduction, isTest } from '../config/env.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const isTurnstileEnabled = () =>
  Boolean(env.TURNSTILE_SECRET_KEY) && !isTest;

const verifyTurnstile = async (token, remoteIp) => {
  if (isTest) return true;

  if (isProduction && !env.TURNSTILE_SECRET_KEY) {
    logger.error('TURNSTILE_SECRET_KEY is required in production');
    throw new AppError('Security verification unavailable', 503, 'CAPTCHA_UNAVAILABLE');
  }

  if (!isTurnstileEnabled()) {
    return true;
  }

  if (!token) {
    throw new AppError('Security verification required', 400, 'CAPTCHA_REQUIRED');
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: remoteIp,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      logger.warn('Turnstile verification failed', {
        errors: result['error-codes'],
        ip: remoteIp,
      });
      throw new AppError('Security verification failed', 403, 'CAPTCHA_FAILED');
    }

    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Turnstile service error:', error.message);
    throw new AppError('Security verification unavailable', 503, 'CAPTCHA_UNAVAILABLE');
  }
};

export { verifyTurnstile, isTurnstileEnabled };
