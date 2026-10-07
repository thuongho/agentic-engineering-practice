const express = require('express');
const comments = require('../services/comments');

// Mounted at /tasks in src/index.js
const commentsRouter = express.Router();

commentsRouter.get('/:id/comments', (req, res) => {
  res.json(comments.listComments(parseInt(req.params.id)));
});

commentsRouter.post('/:id/comments', (req, res) => {
  res.status(201).json(comments.createComment(parseInt(req.params.id), req.body));
});

module.exports = { commentsRouter };
