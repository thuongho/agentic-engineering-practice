# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Taskr: an Express 5 + SQLite (`better-sqlite3`, synchronous) REST API for tasks, projects, users, comments, and tags. CommonJS, no build step, no linter configured.

## Commands

```bash
npm install
npm run db:seed        # create schema + sample data in ./taskr.db
npm run db:reset       # delete taskr.db and re-seed
npm run dev            # node --watch, port 3000 (PORT env overrides)
npm test               # jest
npx jest tests/tasks.test.js          # one file
npx jest -t "returns empty array"     # one test by name
```

Jest only picks up files matching `testMatch` in `package.json`: `tests/*.test.js`. A new test file named anything else will silently not run. Name test files `<resource>.test.js`, e.g. `tasks.test.js`, `tags.test.js`.

## Folder structure

Routes call services, services call queries, queries call the database connection. Each layer calls only the one directly below it, never upward.

```
src/
  index.js          builds the app, mounts the routers, exports it (listens only when run directly)
  routes/           parse the request, call ONE service function, send the response
  services/         validation, orchestration, side effects (email); throw httpError(status, message)
  db/
    queries/        the only place that calls db.prepare(...); uses the connection
    connection.js   the one shared database connection
    seed.js         dev schema + sample data
  middleware/       auth.js, logger.js, error-handler.js
  utils/            constants.js, validation.js, http-error.js, send-email.js
tests/              <resource>.test.js, plus schema.js (test DB schema)
```

## Naming conventions

- All files use `kebab-case.js`: no PascalCase, no camelCase.
- A resource has the same file name in `routes/`, `services/` and `db/queries/` (`tasks.js`, `users.js`, `tags.js`, ...).
- Test files are `tests/<resource>.test.js`. Jest ignores anything else.

## Architecture notes

- `src/db/connection.js` opens one shared connection: `:memory:` when `NODE_ENV=test`, else `DB_PATH` or `taskr.db`. Foreign keys are ON.
- **Schema lives in two places:** `src/db/seed.js` (dev DB) and `tests/schema.js` (test DB). A schema change must be made in both.
- Tests set `NODE_ENV=test` *before* requiring `../src/index`, call `createSchema(db)` in `beforeAll`, and wipe all tables in `beforeEach`. Keep that order — requiring the connection first opens the file DB instead.
- Auth (`src/middleware/auth.js`): `x-api-key` header must equal `API_KEY` env (default `dev-key`). Applied per-route, only to the user and project DELETE routes — not global.
- Errors: services throw `httpError(status, message)`; Express 5 forwards the throw to `src/middleware/error-handler.js`, which responds `{ error: message }`. Unique-constraint violations are detected with `isUniqueViolation(err)` and rethrown as 409.
- Routes for one URL prefix can live in several routers: `/tasks/:id/comments` is in `routes/comments.js` and `/tasks/:id/tags` is in `routes/tags.js` (`taskTagsRouter`); both are mounted at `/tasks` in `src/index.js`.
- Task statuses: `active | completed | archived` (DB `CHECK` constraint + `VALID_TASK_STATUSES` in `src/utils/constants.js`).

## Context files

Read the matching file before starting these tasks:

- `.claude/context/api-conventions.md`: any task involving API routes or endpoints.
- `.claude/context/testing-standards.md`: any task involving tests or test coverage.

## Active Plugins

- **`my-standards`** is active. Its conventions apply to all code in this project.
- Use the `my-standards:api-endpoints` skill whenever adding new routes.

## Verification

After completing any significant change, run `/verify-app` before committing. Do not commit if any tests are failing.

The test suite uses supertest and covers all API endpoints, so a passing run confirms the full application is working correctly.

## Never do these things

- **Never call `db.prepare` outside `src/db/`.** Routes and services go through `src/db/queries/`.
- **Never put business logic or validation in a route handler.** It belongs in the service.
- **Never import upward** (a query requiring a service, a service requiring a route). Layers only call downward.
- **Never add a utility to `src/utils/` without checking whether it belongs in a more specific module.**

## Known gaps (left as-is on purpose)

- `DELETE /tasks/:id` and the tag/comment routes have no auth; only user and project deletes do.
- `authenticate` is a static key check (TODO: real JWT), `send-email.js` only logs to the console, and the webhook in `routes/webhooks.js` only logs the payload.
