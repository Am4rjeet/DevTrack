import env from '../config/env.js';
import githubService from '../services/github.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const connect = asyncHandler(async (req, res) => {
  const result = await githubService.connect(req.user.id, req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const sync = asyncHandler(async (req, res) => {
  const result = await githubService.sync(req.user.id, { force: true });

  res.status(200).json({
    success: true,
    data: result,
  });
});

const disconnect = asyncHandler(async (req, res) => {
  const result = await githubService.disconnect(req.user.id);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const getStats = asyncHandler(async (req, res) => {
  const refresh = req.query.refresh === 'true';
  const result = await githubService.getStats(req.user.id, { refresh });

  res.status(200).json({
    success: true,
    data: result,
  });
});

const getStatus = asyncHandler(async (req, res) => {
  const result = await githubService.getStatus(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      ...result,
      oauthAvailable: githubService.isOAuthConfigured(),
      serverTokenConfigured: Boolean(env.GITHUB_TOKEN),
    },
  });
});

const startOAuth = asyncHandler(async (req, res) => {
  const url = githubService.getOAuthUrl(req.user.id);
  res.redirect(url);
});

const oauthCallback = asyncHandler(async (req, res) => {
  try {
    await githubService.handleOAuthCallback(req.query.code, req.query.state);
    res.redirect(`${env.CLIENT_URL}/settings/github?success=true`);
  } catch (error) {
    const message = error instanceof AppError ? error.code : 'OAUTH_FAILED';
    res.redirect(`${env.CLIENT_URL}/settings/github?error=${message}`);
  }
});

export { connect, sync, disconnect, getStats, getStatus, startOAuth, oauthCallback };
