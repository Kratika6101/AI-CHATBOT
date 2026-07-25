export const requestTimeout = (ms) => (req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ message: 'Request timeout.' });
    }
    req.destroy();
    res.destroy();
  }, ms);

  const cleanup = () => clearTimeout(timeout);

  req.on('close', cleanup);
  res.on('finish', cleanup);
  res.on('close', cleanup);

  next();
};