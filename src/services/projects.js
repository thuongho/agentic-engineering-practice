const queries = require('../db/queries/projects');
const { isNonEmptyString } = require('../utils/validation');
const { httpError } = require('../utils/http-error');

function listProjects() {
  return queries.listProjects();
}

function createProject({ name, description, owner_id }) {
  if (!name || !isNonEmptyString(name)) throw httpError(400, 'name is required');
  return queries.insertProject(name, description || null, owner_id || null);
}

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

function updateProject(id, data) {
  const existing = queries.findProjectById(id);
  if (!existing) throw httpError(404, 'Project not found');

  const name = data.name !== undefined ? data.name : existing.name;
  const description = data.description !== undefined ? data.description : existing.description;
  const ownerId = data.owner_id !== undefined ? data.owner_id : existing.owner_id;
  return queries.updateProject(id, name, description, ownerId);
}

function deleteProject(id) {
  if (queries.deleteProject(id) === 0) throw httpError(404, 'Project not found');
  return { deleted: true };
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject };
