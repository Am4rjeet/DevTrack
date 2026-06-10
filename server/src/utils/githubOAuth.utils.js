import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import AppError from './AppError.js';

const signOAuthState = (userId) =>
  jwt.sign({ sub: userId, purpose: 'github_oauth' }, env.JWT_ACCESS_SECRET, {
    expiresIn: '10m',
  });

const verifyOAuthState = (state) => {
  try {
    const payload = jwt.verify(state, env.JWT_ACCESS_SECRET);
    if (payload.purpose !== 'github_oauth') {
      throw new AppError('Invalid OAuth state', 400, 'OAUTH_STATE_INVALID');
    }
    return payload.sub;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid or expired OAuth state', 400, 'OAUTH_STATE_INVALID');
  }
};

const getOAuthAuthorizeUrl = (state) => {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_OAUTH_CALLBACK_URL,
    scope: 'read:user repo',
    state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

const isOAuthConfigured = () =>
  Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET && env.GITHUB_OAUTH_CALLBACK_URL);

export { signOAuthState, verifyOAuthState, getOAuthAuthorizeUrl, isOAuthConfigured };
