import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import morgan from 'morgan';

import corsMiddleware from './config/cors.js';
import env, { isDevelopment } from './config/env.js';
import { globalRateLimiter } from './middleware/rateLimit.middleware.js';
import { csrfProtection } from './middleware/csrf.middleware.js';
import requestIdMiddleware from './middleware/requestId.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import apiRoutes from './routes/index.js';

const app = express();

if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(requestIdMiddleware);
app.use(helmet());
app.use(corsMiddleware);
app.use(globalRateLimiter);
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

if (isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/api', csrfProtection);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'DevTrack API',
    version: '1.0.0',
    docs: '/api/v1/health',
  });
});

app.use('/api/v1', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
