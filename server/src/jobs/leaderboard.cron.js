import cron from 'node-cron';
import { isTest } from '../config/env.js';
import leaderboardService from '../services/leaderboard.service.js';
import logger from '../utils/logger.js';

const DEFAULT_SCHEDULE = '*/15 * * * *';

const startLeaderboardCron = () => {
  if (isTest) {
    logger.debug('Leaderboard cron disabled in test environment');
    return null;
  }

  const enabled = process.env.LEADERBOARD_CRON_ENABLED !== 'false';
  if (!enabled) {
    logger.info('Leaderboard cron disabled via LEADERBOARD_CRON_ENABLED');
    return null;
  }

  const schedule = process.env.LEADERBOARD_CRON_SCHEDULE || DEFAULT_SCHEDULE;

  const task = cron.schedule(schedule, async () => {
    try {
      logger.info('Running scheduled leaderboard computation...');
      await leaderboardService.computeAll();
    } catch (error) {
      logger.error('Leaderboard cron failed:', error.message);
    }
  });

  logger.info(`Leaderboard cron scheduled: ${schedule}`);

  // Compute immediately on startup
  leaderboardService.computeAll().catch((err) => {
    logger.error('Initial leaderboard computation failed:', err.message);
  });

  return task;
};

export default startLeaderboardCron;
