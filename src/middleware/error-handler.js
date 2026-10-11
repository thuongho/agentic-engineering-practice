/**
 * @description Turns a thrown error into a JSON `{ error }` response, logging only errors without a `status`.
 * @param {Error & { status?: number }} err - Error forwarded by Express.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @param {Function} next - Unused; required for Express to treat this as an error handler.
 * @returns {void} Nothing; sends the response.
 */
function errorHandler(err, req, res, next) {
  // Errors with .status are expected (400/404/409); only log unexpected ones
  if (!err.status) console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
}

module.exports = { errorHandler };
