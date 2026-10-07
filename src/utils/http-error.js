function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function isUniqueViolation(err) {
  return Boolean(err.message && err.message.includes('UNIQUE'));
}

module.exports = { httpError, isUniqueViolation };
