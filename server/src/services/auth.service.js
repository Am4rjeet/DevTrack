import { v4 as uuidv4 } from 'uuid';
import userRepository from '../repositories/user.repository.js';
import emailService from './email.service.js';
import AppError from '../utils/AppError.js';
import env, { isDevelopment, isProduction } from '../config/env.js';
import { generateSecureToken, hashToken } from '../utils/crypto.utils.js';
import { isDisposableEmail } from '../utils/disposableEmail.utils.js';
import logger from '../utils/logger.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getTokenExpiry,
} from '../utils/token.utils.js';

const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;

const issueTokenPair = async (user, deviceId) => {
  const resolvedDeviceId = deviceId || uuidv4();
  const accessToken = signAccessToken(user._id.toString(), user.role);
  const refreshToken = signRefreshToken(user._id.toString(), resolvedDeviceId);
  const refreshHash = hashToken(refreshToken);
  const expiresAt = getTokenExpiry(refreshToken);

  user.addRefreshToken(refreshHash, resolvedDeviceId, expiresAt);
  await userRepository.save(user);

  return {
    accessToken,
    refreshToken,
    deviceId: resolvedDeviceId,
    user,
  };
};

const registrationFailureMessage = isProduction
  ? 'Unable to create account with these details'
  : null;

const authService = {
  async register({ email, username, password, displayName }) {
    if (isDisposableEmail(email)) {
      throw new AppError('Please use a permanent email address', 400, 'INVALID_EMAIL');
    }

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw new AppError(
        registrationFailureMessage || 'Email already registered',
        409,
        isProduction ? 'REGISTRATION_FAILED' : 'EMAIL_EXISTS'
      );
    }

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      throw new AppError(
        registrationFailureMessage || 'Username already taken',
        409,
        isProduction ? 'REGISTRATION_FAILED' : 'USERNAME_EXISTS'
      );
    }

    const rawVerificationToken = generateSecureToken();
    const verificationHash = hashToken(rawVerificationToken);

    const autoVerifyInDev = isDevelopment && env.AUTO_VERIFY_EMAIL_IN_DEV;

    let user;
    try {
      user = await userRepository.create({
        email,
        username,
        password,
        displayName: displayName || username,
        isEmailVerified: autoVerifyInDev,
        emailVerificationToken: autoVerifyInDev ? undefined : verificationHash,
        emailVerificationExpires: autoVerifyInDev
          ? undefined
          : new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS),
      });
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError(
          registrationFailureMessage || 'Account already exists',
          409,
          'REGISTRATION_FAILED'
        );
      }
      logger.error('Registration database error:', error.message);
      throw new AppError('Unable to create account right now', 503, 'SERVICE_UNAVAILABLE');
    }

    if (!autoVerifyInDev) {
      try {
        await emailService.sendVerificationEmail(user, rawVerificationToken);
      } catch (error) {
        logger.error('Verification email failed after signup', {
          userId: user._id,
          error: error.message,
        });
      }
    } else {
      logger.info(`[DEV] Auto-verified new user: ${user.email}`);
    }

    return {
      user,
      message: autoVerifyInDev
        ? 'Registration successful. You can sign in now.'
        : 'Registration successful. Please verify your email before signing in.',
    };
  },

  async login({ email, password, deviceId }) {
    const user = await userRepository.findByEmailWithAuth(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (env.REQUIRE_EMAIL_VERIFICATION && !user.isEmailVerified) {
      throw new AppError(
        'Please verify your email before signing in',
        403,
        'EMAIL_NOT_VERIFIED'
      );
    }

    const tokens = await issueTokenPair(user, deviceId);

    return {
      user: tokens.user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      deviceId: tokens.deviceId,
    };
  },

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token missing', 401, 'REFRESH_TOKEN_MISSING');
    }

    const payload = verifyRefreshToken(refreshToken);
    const refreshHash = hashToken(refreshToken);

    const user = await userRepository.findByIdWithAuth(payload.sub);
    if (!user) {
      throw new AppError('User not found', 401, 'INVALID_TOKEN');
    }

    if (env.REQUIRE_EMAIL_VERIFICATION && !user.isEmailVerified) {
      user.revokeAllRefreshTokens();
      await userRepository.save(user);
      throw new AppError(
        'Please verify your email before signing in',
        403,
        'EMAIL_NOT_VERIFIED'
      );
    }

    const storedToken = user.refreshTokens.find(
      (t) => t.tokenHash === refreshHash && !t.revoked
    );

    if (!storedToken) {
      // Possible token reuse attack — revoke all sessions
      user.revokeAllRefreshTokens();
      await userRepository.save(user);
      throw new AppError('Refresh token revoked. Please log in again.', 401, 'TOKEN_REUSE');
    }

    if (storedToken.expiresAt < new Date()) {
      user.revokeRefreshToken(refreshHash);
      await userRepository.save(user);
      throw new AppError('Refresh token expired', 401, 'TOKEN_EXPIRED');
    }

    // Rotate: revoke old token before issuing new pair
    user.revokeRefreshToken(refreshHash);
    await userRepository.save(user);

    const tokens = await issueTokenPair(user, payload.deviceId);

    return {
      user: tokens.user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      deviceId: tokens.deviceId,
    };
  },

  async logout(userId, refreshToken) {
    if (refreshToken) {
      const user = await userRepository.findByIdWithAuth(userId);
      if (user) {
        const refreshHash = hashToken(refreshToken);
        user.revokeRefreshToken(refreshHash);
        await userRepository.save(user);
      }
    }

    return { message: 'Logged out successfully' };
  },

  async logoutAll(userId) {
    const user = await userRepository.findByIdWithAuth(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    user.revokeAllRefreshTokens();
    await userRepository.save(user);

    return { message: 'All sessions revoked' };
  },

  async verifyEmail(rawToken) {
    const tokenHash = hashToken(rawToken);
    const user = await userRepository.findByEmailVerificationToken(tokenHash);

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await userRepository.save(user);

    return { message: 'Email verified successfully' };
  },

  async resendVerificationEmail(email) {
    const user = await userRepository.findByEmailWithAuth(email);

    if (!user || user.isEmailVerified) {
      return {
        message: 'If that email exists and is unverified, a verification email has been sent',
      };
    }

    const rawToken = generateSecureToken();
    user.emailVerificationToken = hashToken(rawToken);
    user.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);
    await userRepository.save(user);

    await emailService.sendVerificationEmail(user, rawToken);

    return {
      message: 'If that email exists and is unverified, a verification email has been sent',
    };
  },

  async resendVerification(userId) {
    const user = await userRepository.findByIdWithAuth(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.isEmailVerified) {
      throw new AppError('Email is already verified', 400, 'ALREADY_VERIFIED');
    }

    const rawToken = generateSecureToken();
    user.emailVerificationToken = hashToken(rawToken);
    user.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);
    await userRepository.save(user);

    await emailService.sendVerificationEmail(user, rawToken);

    return { message: 'Verification email sent' };
  },

  async forgotPassword(email) {
    const user = await userRepository.findByEmailWithAuth(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If that email exists, a reset link has been sent' };
    }

    const rawToken = generateSecureToken();
    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
    await userRepository.save(user);

    await emailService.sendPasswordResetEmail(user, rawToken);

    return { message: 'If that email exists, a reset link has been sent' };
  },

  async resetPassword({ token, password }) {
    const tokenHash = hashToken(token);
    const user = await userRepository.findByPasswordResetToken(tokenHash);

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.revokeAllRefreshTokens();
    await userRepository.save(user);

    return { message: 'Password reset successful. Please log in.' };
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findByIdWithAuth(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
    }

    if (currentPassword === newPassword) {
      throw new AppError('New password must be different from current password', 400, 'SAME_PASSWORD');
    }

    user.password = newPassword;
    user.revokeAllRefreshTokens();
    await userRepository.save(user);

    return { message: 'Password changed successfully. Please log in again.' };
  },

  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return user;
  },
};

export default authService;
