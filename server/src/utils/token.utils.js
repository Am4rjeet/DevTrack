import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import AppError from './AppError.js';

export const signAccessToken = (userId, role) =>
  jwt.sign({ sub: userId, role, type: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

export const signRefreshToken = (userId, deviceId) =>
  jwt.sign({ sub: userId, deviceId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

export const verifyAccessToken = (token) => {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.type !== 'access') {
      throw new AppError('Invalid token type', 401, 'INVALID_TOKEN');
    }
    return payload;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid or expired access token', 401, 'INVALID_TOKEN');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (payload.type !== 'refresh') {
      throw new AppError('Invalid token type', 401, 'INVALID_TOKEN');
    }
    return payload;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_TOKEN');
  }
};

export const getTokenExpiry = (token) => {
  const decoded = jwt.decode(token);
  if (!decoded?.exp) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return new Date(decoded.exp * 1000);
};
