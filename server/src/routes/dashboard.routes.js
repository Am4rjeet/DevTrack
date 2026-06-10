import { Router } from 'express';
import { authenticate, requireEmailVerified } from '../middleware/auth.middleware.js';
import { getDashboard } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/', authenticate, requireEmailVerified, getDashboard);

export default router;
