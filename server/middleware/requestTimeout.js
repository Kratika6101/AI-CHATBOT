export const requestTimeout = (ms) => (req, res, next) => {
  res.setTimeout(ms, () => {
    res.status(408).json({ message: 'Request timeout.' });
  });
  next();
};