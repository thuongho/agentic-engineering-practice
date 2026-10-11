const { db } = require('../connection');

/**
 * @description Selects a task's comments joined with the author's name, oldest first.
 * @param {number} taskId - ID of the task.
 * @returns {Object[]} Comment rows with `user_name`.
 */
function listCommentsByTask(taskId) {
  return db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.task_id = ? ORDER BY c.created_at ASC'
  ).all(taskId);
}

/**
 * @description Selects one comment joined with the author's name.
 * @param {number} id - ID of the comment.
 * @returns {Object|undefined} The comment row, or undefined.
 */
function findCommentById(id) {
  return db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?'
  ).get(id);
}

/**
 * @description Inserts a comment and reads it back.
 * @param {number} taskId - ID of the task.
 * @param {number} userId - ID of the author.
 * @param {string} body - Comment text.
 * @returns {Object} The inserted comment row.
 */
function insertComment(taskId, userId, body) {
  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)'
  ).run(taskId, userId, body);
  return findCommentById(result.lastInsertRowid);
}

module.exports = { listCommentsByTask, findCommentById, insertComment };
