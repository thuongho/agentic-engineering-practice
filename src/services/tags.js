const queries = require('../db/queries/tags');
const { findTaskById } = require('../db/queries/tasks');
const { isNonEmptyString } = require('../utils/validation');
const { httpError, isUniqueViolation } = require('../utils/http-error');

/**
 * @description Returns all tags ordered by name.
 * @returns {Object[]} The tags.
 */
function listTags() {
  return queries.listTags();
}

/**
 * @description Validates and creates a tag with a lowercased, trimmed name, throwing 409 if it exists.
 * @param {Object} input - Tag fields.
 * @param {string} input.name - Tag name (required).
 * @returns {Object} The created tag.
 */
function createTag({ name }) {
  if (!name || !isNonEmptyString(name)) throw httpError(400, 'name is required');
  try {
    return queries.insertTag(name.toLowerCase().trim());
  } catch (err) {
    if (isUniqueViolation(err)) throw httpError(409, 'tag already exists');
    throw err;
  }
}

/**
 * @description Applies an existing tag to a task, throwing 404 if either is missing and 409 if already applied.
 * @param {number} taskId - ID of the task.
 * @param {Object} input - Request body.
 * @param {number|string} input.tag_id - ID of the tag.
 * @returns {{ task_id: number, tag_id: number }} The new task-tag link.
 */
function addTagToTask(taskId, { tag_id }) {
  if (!findTaskById(taskId)) throw httpError(404, 'Task not found');
  if (!tag_id) throw httpError(400, 'tag_id is required');
  if (!queries.findTagById(parseInt(tag_id))) throw httpError(404, 'Tag not found');

  try {
    queries.addTagToTask(taskId, parseInt(tag_id));
  } catch (err) {
    if (isUniqueViolation(err)) throw httpError(409, 'tag already applied to this task');
    throw err;
  }
  return { task_id: taskId, tag_id: parseInt(tag_id) };
}

/**
 * @description Removes a tag from a task, throwing 404 if it was not applied.
 * @param {number} taskId - ID of the task.
 * @param {number} tagId - ID of the tag.
 * @returns {{ deleted: boolean }} `{ deleted: true }`.
 */
function removeTagFromTask(taskId, tagId) {
  if (queries.removeTagFromTask(taskId, tagId) === 0) throw httpError(404, 'Tag not applied to this task');
  return { deleted: true };
}

module.exports = { listTags, createTag, addTagToTask, removeTagFromTask };
