const queries = require('../db/queries/users');
const { sendEmail } = require('../utils/send-email');
const { validateEmail, isNonEmptyString } = require('../utils/validation');
const { httpError, isUniqueViolation } = require('../utils/http-error');

function listUsers() {
  return queries.listUsers();
}

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

function getUser(id) {
  const user = queries.findUserById(id);
  if (!user) throw httpError(404, 'User not found');
  return user;
}

function updateUser(id, data) {
  const existing = getUser(id);
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  return queries.updateUser(id, name, email);
}

function deleteUser(id) {
  if (queries.deleteUser(id) === 0) throw httpError(404, 'User not found');
  return { deleted: true };
}

module.exports = { listUsers, createUser, getUser, updateUser, deleteUser };
