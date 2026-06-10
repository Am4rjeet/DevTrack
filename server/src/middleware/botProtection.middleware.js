import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { isDevelopment, isTest } from '../config/env.js';
import { verifyTurnstile as verifyTurnstileToken } from '../services/turnstile.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const MIN_FORM_DURATION_MS = 2000;

const stripBotFields = (body = {}) => {
  const { turnstileToken, website, _hp, _ft, ...rest } = body;
  return rest;
};

const evaluateBotSignals = (body = {}, now = Date.now()) => {
  const honeypot = `${body.website || ''}${body._hp || ''}`.trim();
  if (honeypot) {
    return new AppError('Unable to process request', 400, 'INVALID_REQUEST');
  }

  if (!isDevelopment) {
    const formStarted = Number(body._ft);
    if (formStarted && now - formStarted < MIN_FORM_DURATION_MS) {
      return new AppError('Unable to process request', 400, 'INVALID_REQUEST');
    }
  }

  return null;
};

const botProtection = (req, _res, next) => {
  if (isTest) return next();

  const botError = evaluateBotSignals(req.body);
  if (botError) {
    logger.warn('Bot protection triggered', { ip: req.ip, requestId: req.requestId });
    return next(botError);
  }

  next();
};

const verifyTurnstile = asyncHandler(async (req, _res, next) => {
  if (isTest) return next();

  await verifyTurnstileToken(req.body?.turnstileToken, req.ip);
  req.body = stripBotFields(req.body);
  next();
});

export { botProtection, verifyTurnstile, stripBotFields, evaluateBotSignals };
