import env, { isDevelopment } from '../config/env.js';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = isDevelopment ? levels.debug : levels.info;

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (meta !== undefined) {
    return `${base} ${typeof meta === 'object' ? JSON.stringify(meta) : meta}`;
  }
  return base;
};

const logger = {
  error: (message, meta) => {
    if (currentLevel >= levels.error) console.error(formatMessage('error', message, meta));
  },
  warn: (message, meta) => {
    if (currentLevel >= levels.warn) console.warn(formatMessage('warn', message, meta));
  },
  info: (message, meta) => {
    if (currentLevel >= levels.info) console.info(formatMessage('info', message, meta));
  },
  debug: (message, meta) => {
    if (currentLevel >= levels.debug) console.debug(formatMessage('debug', message, meta));
  },
};

export default logger;
