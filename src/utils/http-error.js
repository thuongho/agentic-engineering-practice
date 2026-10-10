/**
 * Creates an Error carrying an HTTP status code, for the error handler to turn into a response.
 * @param {number} status - HTTP status code to respond with (e.g. 400, 404, 409).
 * @param {string} message - Error message sent to the client as `{ error: message }`.
 * @returns {Error & { status: number }} The error, with `status` set.
 */
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Checks whether an error is a SQLite unique-constraint violation.
 * @param {Error} err - Error thrown by the database driver.
 * @returns {boolean} True if the error message contains "UNIQUE".
 */
function isUniqueViolation(err) {
  return Boolean(err.message && err.message.includes('UNIQUE'));
}

module.exports = { httpError, isUniqueViolation };
