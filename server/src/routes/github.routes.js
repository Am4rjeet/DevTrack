import { Router } from 'express';
import { authenticate, requireEmailVerified } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { connectGithubSchema, oauthCallbackSchema } from '../validators/github.validator.js';
import {
  connect,
  sync,
  disconnect,
  getStats,
  getStatus,
  startOAuth,
  oauthCallback,
} from '../controllers/github.controller.js';

const router = Router();

router.get('/oauth/callback', validate(oauthCallbackSchema), oauthCallback);

router.use(authenticate, requireEmailVerified);

router.get('/status', getStatus);
router.get('/', getStats);
router.post('/connect', validate(connectGithubSchema), connect);
router.post('/sync', sync);
router.delete('/disconnect', disconnect);
router.get('/oauth', startOAuth);

export default router;
