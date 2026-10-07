function errorHandler(err, req, res, next) {
  // Errors with .status are expected (400/404/409); only log unexpected ones
  if (!err.status) console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
}

module.exports = { errorHandler };
