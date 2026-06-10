import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { isDevelopment } from '../config/env.js';

const handleZodError = (err) => {
  const details = err.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
  return new AppError('Validation failed', 400, 'VALIDATION_ERROR', details);
};

const handleMongoDuplicateError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';

  if (!isDevelopment) {
    return new AppError('An account with these details already exists', 409, 'DUPLICATE_ERROR');
  }

  const value = err.keyValue?.[field];
  return new AppError(
    `${field} '${value}' already exists`,
    409,
    'DUPLICATE_ERROR',
    [{ field, message: 'Already in use' }]
  );
};

const handleMongoValidationError = (err) => {
  const details = Object.values(err.errors || {}).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError('Validation failed', 400, 'VALIDATION_ERROR', details);
};

const handleJWTError = () => new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');

const errorHandler = (err, req, res, _next) => {
  let error = err;

  if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err.name === 'MongoServerError' && err.code === 11000) {
    error = handleMongoDuplicateError(err);
  } else if (err.name === 'ValidationError' && err.errors) {
    error = handleMongoValidationError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError();
  } else if (!(err instanceof AppError)) {
    logger.error('Unhandled error:', {
      message: err.message,
      stack: err.stack,
      requestId: req.requestId,
    });
    error = new AppError(
      isDevelopment ? err.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }

  if (error.statusCode >= 500) {
    logger.error(`${error.statusCode} ${error.message}`, {
      requestId: req.requestId,
      stack: err.stack,
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message,
      ...(error.details && { details: error.details }),
      ...(isDevelopment && err.stack && { stack: err.stack }),
    },
    requestId: req.requestId,
  });
};

const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'NOT_FOUND'));
};

export { errorHandler, notFoundHandler };
