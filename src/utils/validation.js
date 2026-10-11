/**
 * @description Checks whether a value looks like an email address (`something@domain.tld`, no whitespace).
 * @param {string} email - The value to check.
 * @returns {boolean} True if the value matches the email pattern.
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * @description Checks whether a value is a string with at least one non-whitespace character.
 * @param {*} val - The value to check.
 * @returns {boolean} True if `val` is a string that is not empty after trimming.
 */
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

module.exports = { validateEmail, isNonEmptyString };
