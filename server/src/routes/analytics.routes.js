import { Router } from 'express';
import { authenticate, requireEmailVerified } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  analyticsQuerySchema,
  hoursChartQuerySchema,
  heatmapQuerySchema,
} from '../validators/analytics.validator.js';
import {
  getOverview,
  getHoursChart,
  getXPChart,
  getDSABreakdown,
  getHeatmap,
} from '../controllers/analytics.controller.js';

const router = Router();

router.use(authenticate, requireEmailVerified);

router.get('/overview', validate(analyticsQuerySchema), getOverview);
router.get('/charts/hours', validate(hoursChartQuerySchema), getHoursChart);
router.get('/charts/xp', validate(analyticsQuerySchema), getXPChart);
router.get('/charts/dsa', validate(analyticsQuerySchema), getDSABreakdown);
router.get('/heatmap', validate(heatmapQuerySchema), getHeatmap);

export default router;
