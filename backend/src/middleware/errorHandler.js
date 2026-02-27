const errorHandler = (err, req, res, _next) => {
  const statusCode = 
    err.statusCode || 
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  if (statusCode === 500) {
    console.error('Internal Server Error:', err);
  } else {
    console.log(`Error ${statusCode}:`, err.message);
  }

  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV !== 'production' && {stack: err.stack})
  });
}

module.exports = errorHandler;