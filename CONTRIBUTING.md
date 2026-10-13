# Contributing to Taskr

Taskr is an Express 5 + SQLite (`better-sqlite3`) REST API. CommonJS, no build step, no linter.

## 1. Set up the development environment

You need **Node.js 20 or newer** (the project is developed on Node 24) and npm. SQLite is bundled with `better-sqlite3`, so there is no database server to install.

```bash
git clone <repo-url> taskr
cd taskr
npm install
npm run db:seed
npm run dev
```

- `npm install` downloads a prebuilt `better-sqlite3` binary. If none matches your platform it compiles one, which needs a C++ toolchain (Xcode Command Line Tools on macOS, `build-essential` + `python3` on Linux).
- `npm run db:seed` creates `./taskr.db` with the schema and sample data (5 users, 3 projects, 20 tasks, 15 comments, 8 tags). `npm run db:reset` deletes it and re-seeds.
- `npm run dev` starts the server on port 3000 with file watching. Set `PORT` to change it. Check it at `http://localhost:3000/health`.

### Environment variables

None are required. All have defaults:

| Variable | Default | Used for |
|---|---|---|
| `PORT` | `3000` | Server port |
| `DB_PATH` | `taskr.db` | SQLite file for the dev server |
| `API_KEY` | `dev-key` | Value the `x-api-key` header must match on the user and project `DELETE` routes |
| `NODE_ENV` | — | `test` switches the database to `:memory:` |

## 2. Project structure

Routes call services, services call queries, queries call the database connection. Each layer only calls the one directly below it.

```
src/
  index.js          builds the app, mounts routers, exports it
  routes/           parse the request, call ONE service function, send the response
  services/         validation, orchestration, side effects; throw httpError(status, message)
  db/
    queries/        the only place that calls db.prepare(...)
    connection.js   the one shared database connection
    seed.js         dev schema + sample data
  middleware/       auth.js, logger.js, error-handler.js
  utils/            constants.js, validation.js, http-error.js, send-email.js
tests/              <resource>.test.js, plus schema.js (test DB schema)
```

Rules every change must follow:

- **Never call `db.prepare` outside `src/db/`.**
- **No business logic or validation in route handlers.** It goes in the service.
- **Never import upward** (a query requiring a service, a service requiring a route).
- **File names are `kebab-case.js`.** A resource uses the same file name in `routes/`, `services/` and `db/queries/`.
- **Schema changes go in two places:** `src/db/seed.js` and `tests/schema.js`.

Before working on routes, read [`.claude/context/api-conventions.md`](.claude/context/api-conventions.md). Before writing tests, read [`.claude/context/testing-standards.md`](.claude/context/testing-standards.md).

## 3. Run the test suite

```bash
npm test
```

Other ways to run it:

```bash
npm run test:watch                    # re-run on file changes
npx jest tests/tasks.test.js          # one file
npx jest -t "returns empty array"     # one test by name
```

Tests use Jest + supertest against an in-memory SQLite database. No seed, env vars or running server needed.

Jest only runs files matching `tests/*.test.js`. A test file named anything else **silently does not run**. Name it `tests/<resource>.test.js`.

### What a passing run looks like

The output includes `console.log` lines from the request logger and the stub email sender (`[EMAIL] Sending to: ...`). That is expected noise, not a failure. What matters is the summary at the end:

```
Test Suites: 3 passed, 3 total
Tests:       35 passed, 35 total
Snapshots:   0 total
Time:        0.461 s
Ran all test suites.
```

Pass = every line says `passed` and no `failed` count appears. The totals grow as tests are added.

## 4. Verify with `/verify-app`

`/verify-app` is a Claude Code slash command (defined in [`.claude/commands/verify-app.md`](.claude/commands/verify-app.md)). It runs the full suite serially:

```bash
npm test -- --runInBand
```

If anything fails, it fixes the implementation (not the tests) and re-runs until everything passes, then reports either "All tests passing, all endpoints verified." or the failures still left.

**When to run it:** after any significant change, before committing. That includes new or changed endpoints, service or query changes, schema changes, and refactors. Not using Claude Code? Run `npm test -- --runInBand` yourself.

## 5. Never commit with failing tests

**Do not commit if any test is failing.** Fix the code until the suite is green, then commit. If a test itself is wrong, fixing it is its own deliberate change, not a way to get a red suite through.

## 6. Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): summary
```

- **type:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- **scope:** the area touched, e.g. `tasks`, `tags`, `src`, `commands`, `mcp`
- **summary:** imperative, lowercase, no trailing period

Examples from this repo's history:

```
feat(commands): add /commit-push-pr command
docs(src): add complete JSDoc to all functions
chore: ignore hook log, nested .claude dir and local .mcp.json
```

The scope is optional when a change has no single area, as in the `chore` example.

## 7. Open a pull request

1. Branch off `main`.
2. Make the change, run `/verify-app` (or `npm test -- --runInBand`) until green.
3. Stage your changes with `git add`.
4. Run `/commit-push-pr` in Claude Code. It commits the staged changes with a Conventional Commits message, pushes the branch, and opens a PR with `gh pr create --fill`.

Without Claude Code, do the same by hand: `git commit`, `git push origin <branch>`, `gh pr create --fill`.

## Known gaps (left as-is on purpose)

Don't "fix" these as a side effect of another change:

- `DELETE /tasks/:id` and the tag/comment routes have no auth. Only user and project deletes do.
- `authenticate` is a static key check, not JWT.
- `send-email.js` and the webhook in `routes/webhooks.js` only log to the console.
