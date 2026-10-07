const queries = require('../db/queries/tags');
const { findTaskById } = require('../db/queries/tasks');
const { isNonEmptyString } = require('../utils/validation');
const { httpError, isUniqueViolation } = require('../utils/http-error');

function listTags() {
  return queries.listTags();
}

function createTag({ name }) {
  if (!name || !isNonEmptyString(name)) throw httpError(400, 'name is required');
  try {
    return queries.insertTag(name.toLowerCase().trim());
  } catch (err) {
    if (isUniqueViolation(err)) throw httpError(409, 'tag already exists');
    throw err;
  }
}

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

function removeTagFromTask(taskId, tagId) {
  if (queries.removeTagFromTask(taskId, tagId) === 0) throw httpError(404, 'Tag not applied to this task');
  return { deleted: true };
}

module.exports = { listTags, createTag, addTagToTask, removeTagFromTask };
