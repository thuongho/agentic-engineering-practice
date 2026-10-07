# API conventions: adding an endpoint

How to add a new endpoint to the Taskr API. Layers: route (`src/routes/`) calls service (`src/services/`) calls queries (`src/db/queries/`). All file names are kebab-case.

## Rules

1. **One route file per resource.** New routes go in `src/routes/<resource>.js`. The file name is the resource name, lowercase plural: `tasks.js`, `projects.js`, `tags.js`. If the file already exists, add the route there.
2. **Export a named Express router.** Each route file creates one `express.Router()` and exports it by name: `module.exports = { tagsRouter }`.
3. **No business logic in handlers, no SQL in services.** A handler reads the request, calls one function in `src/services/<resource>.js`, and sends the response. Validation rules and side effects (emails, etc.) live in the service. Every `db.prepare` call lives in `src/db/queries/<resource>.js`.
4. **Services throw, handlers don't catch.** Throw `httpError(404, 'Tag not found')` from `src/utils/http-error.js`. Don't call `res.status(...).json({ error })` from a handler. Express 5 forwards the throw (including from `async` handlers) to `src/middleware/error-handler.js`, which sends `{ error: message }`. Detect duplicate-key errors with `isUniqueViolation(err)` from the same file and rethrow as a 409.
5. **Register in `src/index.js`.** Mount the router with `app.use` using the resource path: `app.use('/tags', tagsRouter)`. Paths inside the router are relative to that mount (`'/'`, `'/:id'`), not `'/tags/:id'`.

## Example

`src/db/queries/tags.js`:

```js
const { db } = require('../connection');

function findTagById(id) {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

module.exports = { findTagById };
```

`src/services/tags.js`:

```js
const queries = require('../db/queries/tags');
const { httpError } = require('../utils/http-error');

function getTag(id) {
  const tag = queries.findTagById(id);
  if (!tag) throw httpError(404, 'Tag not found');
  return tag;
}

module.exports = { getTag };
```

`src/routes/tags.js`:

```js
const express = require('express');
const tags = require('../services/tags');

const tagsRouter = express.Router();

tagsRouter.get('/:id', (req, res) => {
  res.json(tags.getTag(parseInt(req.params.id, 10)));
});

module.exports = { tagsRouter };
```

`src/index.js`:

```js
const { tagsRouter } = require('./routes/tags');

app.use('/tags', tagsRouter);
```

## Checklist

- [ ] Route in `src/routes/<resource>.js`, lowercase plural name
- [ ] File exports a named router
- [ ] Handler only calls a function in `src/services/<resource>.js`
- [ ] SQL lives in `src/db/queries/<resource>.js`, nowhere else
- [ ] Every error path throws `httpError(status, message)` in the service
- [ ] Router mounted in `src/index.js` with `app.use('/<resource>', <resource>Router)`
- [ ] Test added as `tests/<resource>.test.js`
