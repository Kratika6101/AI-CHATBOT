let requestCounter = 0;

export const requestId = (req, res, next) => {
  const id = `req_${Date.now().toString(36)}_${(++requestCounter).toString(36)}`;
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};