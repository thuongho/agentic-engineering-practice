const express = require('express');
const tasks = require('../services/tasks');

const tasksRouter = express.Router();

tasksRouter.get('/', (req, res) => {
  res.json(tasks.listTasks(req.query));
});

tasksRouter.post('/', (req, res) => {
  res.status(201).json(tasks.createTask(req.body));
});

tasksRouter.get('/:id', (req, res) => {
  res.json(tasks.getTask(parseInt(req.params.id)));
});

tasksRouter.put('/:id', (req, res) => {
  res.json(tasks.updateTask(parseInt(req.params.id), req.body));
});

tasksRouter.delete('/:id', (req, res) => {
  res.json(tasks.deleteTask(parseInt(req.params.id)));
});

module.exports = { tasksRouter };
