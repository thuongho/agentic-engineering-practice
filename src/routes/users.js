const express = require('express');
const { authenticate } = require('../middleware/auth');
const users = require('../services/users');

const usersRouter = express.Router();

usersRouter.get('/', (req, res) => {
  res.json(users.listUsers());
});

usersRouter.post('/', async (req, res) => {
  res.status(201).json(await users.createUser(req.body));
});

usersRouter.get('/:id', (req, res) => {
  res.json(users.getUser(parseInt(req.params.id)));
});

usersRouter.put('/:id', (req, res) => {
  res.json(users.updateUser(parseInt(req.params.id), req.body));
});

usersRouter.delete('/:id', authenticate, (req, res) => {
  res.json(users.deleteUser(parseInt(req.params.id)));
});

module.exports = { usersRouter };
