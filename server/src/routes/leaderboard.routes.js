import { Router } from 'express';
import { authenticate, requireEmailVerified, requireRole } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { leaderboardQuerySchema } from '../validators/analytics.validator.js';
import {
  getLeaderboard,
  getMyRank,
  recompute,
} from '../controllers/leaderboard.controller.js';

const router = Router();

router.get('/', validate(leaderboardQuerySchema), getLeaderboard);
router.get('/me', authenticate, requireEmailVerified, validate(leaderboardQuerySchema), getMyRank);
router.post(
  '/recompute',
  authenticate,
  requireRole('admin'),
  validate(leaderboardQuerySchema),
  recompute
);

export default router;
