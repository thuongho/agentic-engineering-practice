/**
 * @description Logs a timestamp, method and URL for each incoming request.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response (unused).
 * @param {Function} next - Passes control to the next handler.
 * @returns {void} Nothing; calls `next()`.
 */
function requestLogger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

module.exports = { requestLogger };
