import { Router } from 'express';
import { authenticate, requireEmailVerified } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createProgressSchema,
  updateProgressSchema,
  progressIdSchema,
  progressListSchema,
  progressSummarySchema,
} from '../validators/progress.validator.js';
import {
  create,
  getAll,
  getById,
  update,
  remove,
  getSummary,
} from '../controllers/progress.controller.js';

const router = Router();

router.use(authenticate, requireEmailVerified);

router.get('/summary', validate(progressSummarySchema), getSummary);
router.get('/', validate(progressListSchema), getAll);
router.post('/', validate(createProgressSchema), create);
router.get('/:id', validate(progressIdSchema), getById);
router.put('/:id', validate(updateProgressSchema), update);
router.delete('/:id', validate(progressIdSchema), remove);

export default router;
