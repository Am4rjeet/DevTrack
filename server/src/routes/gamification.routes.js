import { Router } from 'express';
import { authenticate, requireEmailVerified } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { xpHistorySchema } from '../validators/goal.validator.js';
import {
  getAchievements,
  getXpHistory,
  getStats,
} from '../controllers/gamification.controller.js';

const router = Router();

router.get('/achievements', authenticate, requireEmailVerified, getAchievements);
router.get('/xp', authenticate, requireEmailVerified, validate(xpHistorySchema), getXpHistory);
router.get('/stats', authenticate, requireEmailVerified, getStats);

export default router;
