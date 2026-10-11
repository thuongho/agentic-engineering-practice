const { db } = require('../connection');

/**
 * @description Selects all tags ordered by name.
 * @returns {Object[]} Tag rows.
 */
function listTags() {
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
}

/**
 * @description Selects one tag by ID.
 * @param {number} id - ID of the tag.
 * @returns {Object|undefined} The tag row, or undefined.
 */
function findTagById(id) {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

/**
 * @description Inserts a tag and reads it back.
 * @param {string} name - Unique tag name.
 * @returns {Object} The inserted tag row.
 */
function insertTag(name) {
  const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
  return findTagById(result.lastInsertRowid);
}

/**
 * @description Selects the tags applied to a task.
 * @param {number} taskId - ID of the task.
 * @returns {Object[]} Tag rows.
 */
function listTagsByTask(taskId) {
  return db.prepare(
    'SELECT t.* FROM tags t JOIN task_tags tt ON tt.tag_id = t.id WHERE tt.task_id = ?'
  ).all(taskId);
}

/**
 * @description Inserts a task-tag link.
 * @param {number} taskId - ID of the task.
 * @param {number} tagId - ID of the tag.
 * @returns {void} Nothing.
 */
function addTagToTask(taskId, tagId) {
  db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);
}

/**
 * @description Deletes a task-tag link.
 * @param {number} taskId - ID of the task.
 * @param {number} tagId - ID of the tag.
 * @returns {number} Number of rows deleted (0 or 1).
 */
function removeTagFromTask(taskId, tagId) {
  return db.prepare(
    'DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?'
  ).run(taskId, tagId).changes;
}

module.exports = { listTags, findTagById, insertTag, listTagsByTask, addTagToTask, removeTagFromTask };
