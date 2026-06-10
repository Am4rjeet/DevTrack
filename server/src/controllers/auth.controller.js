import authService from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sanitizeUserForClient } from '../utils/sanitizeUser.utils.js';
import { CSRF_COOKIE_NAME } from '../middleware/csrf.middleware.js';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
} from '../config/cookies.js';
const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions);
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);
};

const clearAuthCookies = (res) => {
  res.cookie(ACCESS_TOKEN_COOKIE, '', clearAccessTokenCookie);
  res.cookie(REFRESH_TOKEN_COOKIE, '', clearRefreshTokenCookie);
};

const sendAuthResponse = (res, statusCode, { user, accessToken, refreshToken, deviceId, message }) => {
  setAuthCookies(res, { accessToken, refreshToken });

  res.status(statusCode).json({
    success: true,
    data: {
      user: sanitizeUserForClient(user),
      ...(deviceId && { deviceId }),
      ...(message && { message }),
    },
  });
};

const getCsrfToken = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      csrfToken: req.csrfToken || req.cookies[CSRF_COOKIE_NAME] || null,
    },
  });
});

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    success: true,
    data: {
      user: sanitizeUserForClient(result.user),
      message: result.message,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendAuthResponse(res, 200, result);
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
  const result = await authService.refresh(refreshToken);
  sendAuthResponse(res, 200, result);
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
  const result = await authService.logout(req.user.id, refreshToken);
  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const logoutAll = asyncHandler(async (req, res) => {
  const result = await authService.logoutAll(req.user.id);
  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);

  res.status(200).json({
    success: true,
    data: { user: sanitizeUserForClient(user) },
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.params.token);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  const result = await authService.resendVerification(req.user.id);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const result = await authService.resendVerificationEmail(req.body.email);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);
  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export {
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
};
