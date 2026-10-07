const express = require('express');
const tags = require('../services/tags');

const tagsRouter = express.Router();

tagsRouter.get('/', (req, res) => {
  res.json(tags.listTags());
});

tagsRouter.post('/', (req, res) => {
  res.status(201).json(tags.createTag(req.body));
});

// Mounted at /tasks in src/index.js
const taskTagsRouter = express.Router();

taskTagsRouter.post('/:id/tags', (req, res) => {
  res.status(201).json(tags.addTagToTask(parseInt(req.params.id), req.body));
});

taskTagsRouter.delete('/:id/tags/:tagId', (req, res) => {
  res.json(tags.removeTagFromTask(parseInt(req.params.id), parseInt(req.params.tagId)));
});

module.exports = { tagsRouter, taskTagsRouter };
