import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import progressRoutes from './progress.routes.js';
import goalRoutes from './goal.routes.js';
import gamificationRoutes from './gamification.routes.js';
import analyticsRoutes from './analytics.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import leaderboardRoutes from './leaderboard.routes.js';
import userRoutes from './user.routes.js';
import githubRoutes from './github.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/progress', progressRoutes);
router.use('/goals', goalRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/users', userRoutes);
router.use('/github', githubRoutes);
router.use('/', gamificationRoutes);

export default router;
