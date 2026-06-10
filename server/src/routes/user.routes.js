import { Router } from 'express';
import validate from '../middleware/validate.middleware.js';
import { usernameParamSchema } from '../validators/analytics.validator.js';
import { getPublicProfile } from '../controllers/user.controller.js';

const router = Router();

router.get('/:username', validate(usernameParamSchema), getPublicProfile);

export default router;
