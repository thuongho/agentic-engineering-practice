const queries = require('../db/queries/tasks');
const { findProjectById } = require('../db/queries/projects');
const { findUserById } = require('../db/queries/users');
const { listTagsByTask } = require('../db/queries/tags');
const { listCommentsByTask } = require('../db/queries/comments');
const { VALID_TASK_STATUSES } = require('../utils/constants');
const { isNonEmptyString } = require('../utils/validation');
const { httpError } = require('../utils/http-error');

/**
 * @description Throws 400 if a given status is not one of `VALID_TASK_STATUSES`; falsy values pass.
 * @param {string|undefined} status - Status to check.
 * @returns {void} Nothing.
 */
function assertValidStatus(status) {
  if (status && !VALID_TASK_STATUSES.includes(status)) {
    throw httpError(400, `status must be one of: ${VALID_TASK_STATUSES.join(', ')}`);
  }
}

/**
 * @description Lists tasks filtered by status, project and assignee, with page-based pagination (page size capped at 100).
 * @param {Object} filters - Query parameters.
 * @param {string} [filters.status] - Task status.
 * @param {number|string} [filters.project_id] - Project ID.
 * @param {number|string} [filters.assignee_id] - Assignee user ID.
 * @param {number|string} [filters.page] - 1-based page number (default 1).
 * @param {number|string} [filters.page_size] - Page size (default 20, max 100).
 * @returns {Object[]} The matching tasks, newest first.
 */
function listTasks({ status, project_id, assignee_id, page, page_size }) {
  assertValidStatus(status);

  const limit = Math.min(100, parseInt(page_size) || 20);
  const offset = ((parseInt(page) || 1) - 1) * limit;

  return queries.listTasks({
    status: status || undefined,
    projectId: project_id ? parseInt(project_id) : undefined,
    assigneeId: assignee_id ? parseInt(assignee_id) : undefined,
    limit,
    offset
  });
}

/**
 * @description Validates and creates a task, checking that any referenced project and assignee exist.
 * @param {Object} input - Task fields.
 * @param {string} input.title - Task title (required).
 * @param {string} [input.description] - Optional description.
 * @param {number|string} [input.project_id] - Optional project ID.
 * @param {number|string} [input.assignee_id] - Optional assignee user ID.
 * @param {string} [input.due_date] - Optional due date.
 * @returns {Object} The created task.
 */
function createTask({ title, description, project_id, assignee_id, due_date }) {
  if (!title || !isNonEmptyString(title)) throw httpError(400, 'title is required');
  if (project_id && !findProjectById(parseInt(project_id))) throw httpError(400, 'project not found');
  if (assignee_id && !findUserById(parseInt(assignee_id))) throw httpError(400, 'assignee not found');

  return queries.insertTask({
    title,
    description: description || null,
    projectId: project_id ? parseInt(project_id) : null,
    assigneeId: assignee_id ? parseInt(assignee_id) : null,
    dueDate: due_date || null
  });
}

/**
 * @description Returns a task with its tags and comments, throwing 404 if missing.
 * @param {number} id - ID of the task.
 * @returns {Object} The task plus `tags` and `comments`.
 */
function getTask(id) {
  const task = queries.findTaskById(id);
  if (!task) throw httpError(404, 'Task not found');
  task.tags = listTagsByTask(id);
  task.comments = listCommentsByTask(id);
  return task;
}

/**
 * @description Updates the provided fields of a task, keeping the rest, and sets or clears `completed_at` as the status changes.
 * @param {number} id - ID of the task.
 * @param {Object} data - Fields to change.
 * @param {string} [data.title] - Title.
 * @param {string} [data.description] - Description.
 * @param {string} [data.status] - Status, one of `VALID_TASK_STATUSES`.
 * @param {number} [data.project_id] - Project ID.
 * @param {number} [data.assignee_id] - Assignee user ID.
 * @param {string} [data.due_date] - Due date.
 * @returns {Object} The updated task.
 */
function updateTask(id, { title, description, status, project_id, assignee_id, due_date }) {
  const existing = queries.findTaskById(id);
  if (!existing) throw httpError(404, 'Task not found');
  assertValidStatus(status);

  const updatedStatus = status !== undefined ? status : existing.status;
  const completedAt = updatedStatus === 'completed' && existing.status !== 'completed'
    ? new Date().toISOString()
    : (updatedStatus !== 'completed' ? null : existing.completed_at);

  return queries.updateTask(id, {
    title: title !== undefined ? title : existing.title,
    description: description !== undefined ? description : existing.description,
    status: updatedStatus,
    projectId: project_id !== undefined ? project_id : existing.project_id,
    assigneeId: assignee_id !== undefined ? assignee_id : existing.assignee_id,
    dueDate: due_date !== undefined ? due_date : existing.due_date,
    completedAt
  });
}

/**
 * @description Deletes a task, throwing 404 if missing.
 * @param {number} id - ID of the task.
 * @returns {{ deleted: boolean }} `{ deleted: true }`.
 */
function deleteTask(id) {
  if (queries.deleteTask(id) === 0) throw httpError(404, 'Task not found');
  return { deleted: true };
}

module.exports = { listTasks, createTask, getTask, updateTask, deleteTask };
