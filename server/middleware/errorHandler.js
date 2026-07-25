import { logger } from '../utils/logger.js';

export const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};

export const errorHandler = (err, req, res, next) => {
  try {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err?.statusCode) {
      statusCode = err.statusCode;
      message = err.message || message;
    } else if (err?.status) {
      statusCode = err.status;
      message = err.message || message;
    } else if (res?.statusCode && res.statusCode !== 200) {
      statusCode = res.statusCode;
      message = err?.message || message;
    } else if (err?.message) {
      message = err.message;
    }

    logger.error('Unhandled error', {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      message,
      error: err?.message,
    });

    res.status(statusCode).json({
      message,
      ...(process.env.NODE_ENV === 'development' && err?.stack
        ? { stack: err.stack }
        : {}),
    });
  } catch (handlerError) {
    logger.error('Error handler failure', { error: handlerError?.message });
    res.status(500).json({ message: 'Internal Server Error' });
  }
};