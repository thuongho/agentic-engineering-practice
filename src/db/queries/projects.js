const { db } = require('../connection');

/**
 * @description Selects all projects, newest first.
 * @returns {Object[]} Project rows.
 */
function listProjects() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

/**
 * @description Selects one project by ID.
 * @param {number} id - ID of the project.
 * @returns {Object|undefined} The project row, or undefined.
 */
function findProjectById(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

/**
 * @description Inserts a project and reads it back.
 * @param {string} name - Project name.
 * @param {string|null} description - Description.
 * @param {number|null} ownerId - Owner user ID.
 * @returns {Object} The inserted project row.
 */
function insertProject(name, description, ownerId) {
  const result = db.prepare(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)'
  ).run(name, description, ownerId);
  return findProjectById(result.lastInsertRowid);
}

/**
 * @description Overwrites a project's name, description and owner, and reads it back.
 * @param {number} id - ID of the project.
 * @param {string} name - Project name.
 * @param {string|null} description - Description.
 * @param {number|null} ownerId - Owner user ID.
 * @returns {Object} The updated project row.
 */
function updateProject(id, name, description, ownerId) {
  db.prepare(
    'UPDATE projects SET name = ?, description = ?, owner_id = ? WHERE id = ?'
  ).run(name, description, ownerId, id);
  return findProjectById(id);
}

/**
 * @description Deletes a project by ID.
 * @param {number} id - ID of the project.
 * @returns {number} Number of rows deleted (0 or 1).
 */
function deleteProject(id) {
  return db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes;
}

/**
 * @description Counts a project's tasks grouped by status.
 * @param {number} projectId - ID of the project.
 * @returns {Array<{ status: string, count: number }>} One row per status present.
 */
function countTasksByStatus(projectId) {
  return db.prepare(
    'SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY status'
  ).all(projectId);
}

module.exports = {
  listProjects,
  findProjectById,
  insertProject,
  updateProject,
  deleteProject,
  countTasksByStatus
};
