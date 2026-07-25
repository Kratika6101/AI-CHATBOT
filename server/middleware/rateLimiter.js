import rateLimit from 'express-rate-limit';

const noopLimiter = (req, res, next) => next();

export function chatLimiter(req, res, next) {
  if (process.env.NODE_ENV === 'development') {
    return noopLimiter(req, res, next);
  }

  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 200),
    message: { message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  return limiter(req, res, next);
}