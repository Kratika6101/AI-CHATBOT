import rateLimit from 'express-rate-limit';

const noopLimiter = (req, res, next) => next();

let sharedLimiter = null;

function getLimiter() {
  if (!sharedLimiter) {
    sharedLimiter = rateLimit({
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000),
      max: Number(process.env.RATE_LIMIT_MAX || 200),
      message: { message: 'Too many requests. Please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }
  return sharedLimiter;
}

export function chatLimiter(req, res, next) {
  if (process.env.NODE_ENV === 'development') {
    return noopLimiter(req, res, next);
  }

  return getLimiter()(req, res, next);
}