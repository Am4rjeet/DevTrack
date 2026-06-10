import { Router } from 'express';
import { authenticate, requireEmailVerified } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createGoalSchema,
  updateGoalSchema,
  goalIdSchema,
  goalListSchema,
  milestoneParamsSchema,
} from '../validators/goal.validator.js';
import {
  create,
  getAll,
  getById,
  update,
  remove,
  toggleMilestone,
  complete,
} from '../controllers/goal.controller.js';

const router = Router();

router.use(authenticate, requireEmailVerified);

router.get('/', validate(goalListSchema), getAll);
router.post('/', validate(createGoalSchema), create);
router.get('/:id', validate(goalIdSchema), getById);
router.put('/:id', validate(updateGoalSchema), update);
router.delete('/:id', validate(goalIdSchema), remove);
router.patch('/:id/complete', validate(goalIdSchema), complete);
router.patch(
  '/:id/milestones/:milestoneId',
  validate(milestoneParamsSchema),
  toggleMilestone
);

export default router;
