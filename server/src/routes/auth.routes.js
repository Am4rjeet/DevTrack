import { Router } from 'express';
import {
  authRateLimiter,
  registerRateLimiter,
  loginRateLimiter,
} from '../middleware/rateLimit.middleware.js';
import { botProtection, verifyTurnstile } from '../middleware/botProtection.middleware.js';
import { signupGuard } from '../middleware/signupGuard.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailParamsSchema,
} from '../validators/auth.validator.js';
import {
  getCsrfToken,
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  verifyEmail,
  resendVerification,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/auth.controller.js';

const router = Router();

router.get('/csrf', getCsrfToken);

router.post(
  '/register',
  registerRateLimiter,
  botProtection,
  verifyTurnstile,
  signupGuard,
  validate(registerSchema),
  register
);
router.post(
  '/login',
  loginRateLimiter,
  botProtection,
  verifyTurnstile,
  validate(loginSchema),
  login
);
router.post('/refresh', authRateLimiter, refresh);
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);

router.get('/me', authenticate, getMe);

router.get('/verify-email/:token', validate(verifyEmailParamsSchema), verifyEmail);
router.post(
  '/resend-verification-email',
  authRateLimiter,
  botProtection,
  verifyTurnstile,
  validate(forgotPasswordSchema),
  resendVerificationEmail
);
router.post('/resend-verification', authenticate, resendVerification);

router.post(
  '/forgot-password',
  authRateLimiter,
  botProtection,
  verifyTurnstile,
  validate(forgotPasswordSchema),
  forgotPassword
);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
