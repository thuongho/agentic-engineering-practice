const { db } = require('../connection');

/**
 * @description Selects all users, newest first.
 * @returns {Object[]} User rows.
 */
function listUsers() {
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
}

/**
 * @description Selects one user by ID.
 * @param {number} id - ID of the user.
 * @returns {Object|undefined} The user row, or undefined.
 */
function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

/**
 * @description Inserts a user and reads it back.
 * @param {string} name - User name.
 * @param {string} email - Unique email address.
 * @returns {Object} The inserted user row.
 */
function insertUser(name, email) {
  const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
  return findUserById(result.lastInsertRowid);
}

/**
 * @description Overwrites a user's name and email and reads it back.
 * @param {number} id - ID of the user.
 * @param {string} name - User name.
 * @param {string} email - Email address.
 * @returns {Object} The updated user row.
 */
function updateUser(id, name, email) {
  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
  return findUserById(id);
}

/**
 * @description Deletes a user by ID.
 * @param {number} id - ID of the user.
 * @returns {number} Number of rows deleted (0 or 1).
 */
function deleteUser(id) {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id).changes;
}

module.exports = { listUsers, findUserById, insertUser, updateUser, deleteUser };
