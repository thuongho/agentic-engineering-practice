// TODO: replace with real JWT validation

/**
 * @description Rejects requests whose `x-api-key` header does not match `API_KEY` (default `dev-key`).
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @param {Function} next - Called when the key is valid.
 * @returns {void} Nothing; calls `next()` or responds 401.
 */
function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === (process.env.API_KEY || 'dev-key')) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { authenticate };
