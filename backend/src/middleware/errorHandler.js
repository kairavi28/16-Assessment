const notFound = (req, res, next) => {
  const err = new Error('Route Not Found');
  err.status = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${status}: ${message}`);
  }
  
  res.status(status).json({
    error: {
      message,
      status
    }
  });
};

module.exports = { notFound, errorHandler };
