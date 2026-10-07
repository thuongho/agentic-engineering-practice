const queries = require('../db/queries/comments');
const { findTaskById } = require('../db/queries/tasks');
const { findUserById } = require('../db/queries/users');
const { isNonEmptyString } = require('../utils/validation');
const { httpError } = require('../utils/http-error');

function listComments(taskId) {
  if (!findTaskById(taskId)) throw httpError(404, 'Task not found');
  return queries.listCommentsByTask(taskId);
}

function createComment(taskId, { user_id, body }) {
  if (!findTaskById(taskId)) throw httpError(404, 'Task not found');
  if (!body || !isNonEmptyString(body)) throw httpError(400, 'body is required');
  if (!user_id) throw httpError(400, 'user_id is required');
  if (!findUserById(parseInt(user_id))) throw httpError(400, 'user not found');

  return queries.insertComment(taskId, parseInt(user_id), body);
}

module.exports = { listComments, createComment };
