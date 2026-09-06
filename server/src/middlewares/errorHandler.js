function errorHandler(err, req, res, next) {
  console.error('⚠️ خطأ في الخادم:', err);

  const status = err.status || 500;
  const message = err.message || 'حدث خطأ داخلي في الخادم، يرجى المحاولة لاحقاً';

  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
