const queries = require('../db/queries/comments');
const { findTaskById } = require('../db/queries/tasks');
const { findUserById } = require('../db/queries/users');
const { isNonEmptyString } = require('../utils/validation');
const { httpError } = require('../utils/http-error');

/**
 * @description Returns all comments on a task, throwing 404 if the task does not exist.
 * @param {number} taskId - ID of the task.
 * @returns {Object[]} Comments with `user_name`, oldest first.
 */
function listComments(taskId) {
  if (!findTaskById(taskId)) throw httpError(404, 'Task not found');
  return queries.listCommentsByTask(taskId);
}

/**
 * @description Validates and creates a comment on a task by an existing user.
 * @param {number} taskId - ID of the task.
 * @param {Object} input - Comment fields.
 * @param {number|string} input.user_id - ID of the commenting user.
 * @param {string} input.body - Comment text.
 * @returns {Object} The created comment.
 */
function createComment(taskId, { user_id, body }) {
  if (!findTaskById(taskId)) throw httpError(404, 'Task not found');
  if (!body || !isNonEmptyString(body)) throw httpError(400, 'body is required');
  if (!user_id) throw httpError(400, 'user_id is required');
  if (!findUserById(parseInt(user_id))) throw httpError(400, 'user not found');

  return queries.insertComment(taskId, parseInt(user_id), body);
}

module.exports = { listComments, createComment };
