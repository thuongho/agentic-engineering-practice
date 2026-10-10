---
description: Run the full verification suite after a significant change
---

Run the full verification suite for this project.

1. Run `npm test -- --runInBand` (runs the test suite serially).
2. The suite uses supertest and exercises all API endpoints directly. If tests pass, the server and all endpoints are working correctly.
3. If any tests fail, fix the implementation (not the tests) and run `npm test -- --runInBand` again. Repeat until all pass.
4. Report the result clearly:
   - Either: "All tests passing, all endpoints verified."
   - Or: the specific failures that still need addressing.
