# Testing standards

How to write tests for the Taskr API. `tests/tasks.test.js` follows these rules. All test files follow the same pattern: `tasks.test.js`, `users.test.js`, `projects.test.js`.

## Rules

1. **File name is `tests/<resource>.test.js`, lowercase.** Examples: `tasks.test.js`, `tags.test.js`, `comments.test.js`. Jest only runs files that match `testMatch` in `package.json`, and `tests/*.test.js` covers this pattern.
2. **Jest + supertest against in-memory SQLite.** Send requests to the exported app with `request(app)`. Don't start a server. Setting `NODE_ENV=test` makes `src/db/connection.js` open `:memory:`, so no database file, seed, or external service is needed.
3. **Every endpoint gets a happy path and at least two error cases.** Pick the errors that endpoint can actually return: `400` invalid or missing input, `404` unknown id, `401` missing API key (protected routes), `409` duplicate.
4. **Descriptions say what the endpoint does, in plain English.** One `describe` per endpoint (`'POST /tags'`), and each `test` names the behaviour a client sees.
   - Good: `'returns 404 when the tag does not exist'`
   - Bad: `'calls getTagById and gets undefined'`, `'db.prepare returns null'`
5. **`npm test` runs everything with no other setup.** No seed step, no required env vars, no running server, no order dependence between files or tests. Each test creates the rows it needs.

## File skeleton

Keep this order. `NODE_ENV` must be set before `../src/index` is required, or `src/db/connection.js` opens the real `taskr.db`.

```js
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/index');
const { db } = require('../src/db/connection');
const { createSchema } = require('./schema');

beforeAll(() => {
  createSchema(db);
});

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
});

describe('POST /tags', () => {
  test('creates a tag', async () => {
    const res = await request(app).post('/tags').send({ name: 'urgent' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('urgent');
  });

  test('returns 400 when name is missing', async () => {
    const res = await request(app).post('/tags').send({});
    expect(res.status).toBe(400);
  });

  test('returns 409 when the tag already exists', async () => {
    await request(app).post('/tags').send({ name: 'urgent' });
    const res = await request(app).post('/tags').send({ name: 'urgent' });
    expect(res.status).toBe(409);
  });
});
```

Protected routes need the API key header. Its default is `dev-key`, so no env var is needed: `.set('x-api-key', 'dev-key')`.

A new table must be added to `tests/schema.js` as well as `src/db/seed.js`, and to the `DELETE FROM` list in `beforeEach`. Delete child tables before the tables they reference, because foreign keys are ON.

## Checklist

- [ ] File is `tests/<resource>.test.js`, lowercase
- [ ] `NODE_ENV = 'test'` is the first line
- [ ] Each endpoint has a happy path and 2+ error cases
- [ ] Test names describe behaviour, not implementation
- [ ] `npm test` passes from a fresh clone after `npm install`
