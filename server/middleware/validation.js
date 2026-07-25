import { logger } from '../utils/logger.js';

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const validateMessage = (req, res, next) => {
  const { message } = req.body || {};

  if (typeof message !== 'string') {
    logger.warn('Validation failed: message not a string', { requestId: req.id });
    return res.status(400).json({ message: 'Message must be a string.' });
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    logger.warn('Validation failed: empty message', { requestId: req.id });
    return res.status(400).json({ message: 'Message cannot be empty or whitespace only.' });
  }

  if (trimmed.length > 2000) {
    logger.warn('Validation failed: message too long', { requestId: req.id, length: trimmed.length });
    return res.status(400).json({ message: 'Message is too long. Max length is 2000 characters.' });
  }

  req.body.message = trimmed;
  next();
};