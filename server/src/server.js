import app from './app.js';
import env from './config/env.js';
import { connectDatabase } from './config/database.js';
import startLeaderboardCron from './jobs/leaderboard.cron.js';
import logger from './utils/logger.js';
import dns from "dns";
dns.setServers(["1.1.1.1","8.8.8.8"]);


const startServer = async () => {
  await connectDatabase();
  startLeaderboardCron();

  const server = app.listen(env.PORT, () => {
    logger.info(`DEVTRACK API running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`Health check: http://localhost:${env.PORT}/api/v1/health`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
};

startServer();
