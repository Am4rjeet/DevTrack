import env from './env.js';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export const getBaseCookieOptions = () => {
  const secure = env.COOKIE_SECURE;

  return {
    secure,
    sameSite: secure ? 'none' : 'lax',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
};

const baseOptions = getBaseCookieOptions();

export const accessTokenCookieOptions = {
  ...baseOptions,
  httpOnly: true,
  path: '/api',
  maxAge: 15 * 60 * 1000,
};

export const refreshTokenCookieOptions = {
  ...baseOptions,
  httpOnly: true,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const clearAccessTokenCookie = {
  ...accessTokenCookieOptions,
  maxAge: 0,
};

export const clearRefreshTokenCookie = {
  ...refreshTokenCookieOptions,
  maxAge: 0,
};
