const express = require('express');
const { authenticate } = require('../middleware/auth');
const projects = require('../services/projects');

const projectsRouter = express.Router();

projectsRouter.get('/', (req, res) => {
  res.json(projects.listProjects());
});

projectsRouter.post('/', (req, res) => {
  res.status(201).json(projects.createProject(req.body));
});

projectsRouter.get('/:id', (req, res) => {
  res.json(projects.getProject(parseInt(req.params.id)));
});

projectsRouter.put('/:id', (req, res) => {
  res.json(projects.updateProject(parseInt(req.params.id), req.body));
});

projectsRouter.delete('/:id', authenticate, (req, res) => {
  res.json(projects.deleteProject(parseInt(req.params.id)));
});

module.exports = { projectsRouter };
