export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const validateMessage = (req, res, next) => {
  const { message } = req.body || {};

  if (typeof message !== 'string') {
    return res.status(400).json({ message: 'Message must be a string.' });
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return res.status(400).json({ message: 'Message cannot be empty or whitespace only.' });
  }

  if (trimmed.length > 2000) {
    return res.status(400).json({ message: 'Message is too long. Max length is 2000 characters.' });
  }

  req.body.message = trimmed;
  next();
};