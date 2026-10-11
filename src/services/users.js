const queries = require('../db/queries/users');
const { sendEmail } = require('../utils/send-email');
const { validateEmail, isNonEmptyString } = require('../utils/validation');
const { httpError, isUniqueViolation } = require('../utils/http-error');

/**
 * @description Returns all users, newest first.
 * @returns {Object[]} The users.
 */
function listUsers() {
  return queries.listUsers();
}

/**
 * @description Validates and creates a user, then sends a welcome email; throws 409 on a duplicate email.
 * @param {Object} input - User fields.
 * @param {string} input.name - User name (required).
 * @param {string} input.email - Unique, valid email address (required).
 * @returns {Promise<Object>} The created user.
 */
async function createUser({ name, email }) {
  if (!name || !isNonEmptyString(name)) throw httpError(400, 'name is required');
  if (!email || !isNonEmptyString(email)) throw httpError(400, 'email is required');
  if (!validateEmail(email)) throw httpError(400, 'Invalid email address');

  let user;
  try {
    user = queries.insertUser(name, email);
  } catch (err) {
    if (isUniqueViolation(err)) throw httpError(409, 'email already exists');
    throw err;
  }

  await sendEmail({
    to: user.email,
    subject: 'Welcome to Taskr!',
    body: `Hi ${user.name}, your account is ready. Start managing your tasks at taskr.io.`
  });

  return user;
}

/**
 * @description Returns a user, throwing 404 if missing.
 * @param {number} id - ID of the user.
 * @returns {Object} The user.
 */
function getUser(id) {
  const user = queries.findUserById(id);
  if (!user) throw httpError(404, 'User not found');
  return user;
}

/**
 * @description Updates the provided fields of a user, keeping the rest, throwing 404 if missing.
 * @param {number} id - ID of the user.
 * @param {Object} data - Fields to change (`name`, `email`).
 * @returns {Object} The updated user.
 */
function updateUser(id, data) {
  const existing = getUser(id);
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  return queries.updateUser(id, name, email);
}

/**
 * @description Deletes a user, throwing 404 if missing.
 * @param {number} id - ID of the user.
 * @returns {{ deleted: boolean }} `{ deleted: true }`.
 */
function deleteUser(id) {
  if (queries.deleteUser(id) === 0) throw httpError(404, 'User not found');
  return { deleted: true };
}

module.exports = { listUsers, createUser, getUser, updateUser, deleteUser };
