const queries = require('../db/queries/projects');
const { isNonEmptyString } = require('../utils/validation');
const { httpError } = require('../utils/http-error');

/**
 * @description Returns all projects, newest first.
 * @returns {Object[]} The projects.
 */
function listProjects() {
  return queries.listProjects();
}

/**
 * @description Validates and creates a project.
 * @param {Object} input - Project fields.
 * @param {string} input.name - Project name (required).
 * @param {string} [input.description] - Optional description.
 * @param {number} [input.owner_id] - Optional owner user ID.
 * @returns {Object} The created project.
 */
function createProject({ name, description, owner_id }) {
  if (!name || !isNonEmptyString(name)) throw httpError(400, 'name is required');
  return queries.insertProject(name, description || null, owner_id || null);
}

/**
 * @description Returns a project with its task counts per status, throwing 404 if missing.
 * @param {number} id - ID of the project.
 * @returns {Object} The project plus `stats` (`total`, `active`, `completed`, `archived`).
 */
function getProject(id) {
  const project = queries.findProjectById(id);
  if (!project) throw httpError(404, 'Project not found');

  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of queries.countTasksByStatus(id)) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return { ...project, stats };
}

/**
 * @description Updates the provided fields of a project, keeping the rest, throwing 404 if missing.
 * @param {number} id - ID of the project.
 * @param {Object} data - Fields to change (`name`, `description`, `owner_id`).
 * @returns {Object} The updated project.
 */
function updateProject(id, data) {
  const existing = queries.findProjectById(id);
  if (!existing) throw httpError(404, 'Project not found');

  const name = data.name !== undefined ? data.name : existing.name;
  const description = data.description !== undefined ? data.description : existing.description;
  const ownerId = data.owner_id !== undefined ? data.owner_id : existing.owner_id;
  return queries.updateProject(id, name, description, ownerId);
}

/**
 * @description Deletes a project, throwing 404 if missing.
 * @param {number} id - ID of the project.
 * @returns {{ deleted: boolean }} `{ deleted: true }`.
 */
function deleteProject(id) {
  if (queries.deleteProject(id) === 0) throw httpError(404, 'Project not found');
  return { deleted: true };
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject };
