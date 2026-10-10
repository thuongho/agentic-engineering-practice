---
description: Commit staged changes, push the current branch, and open a pull request
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git commit:*), Bash(git push:*), Bash(git branch:*), Bash(gh pr create:*)
---

Commit the staged changes, push them, and open a pull request. Follow these steps in order:

1. Run `git status` to show what will be committed.
2. Run `git diff --staged` to review the staged changes. If nothing is staged, stop and tell the user.
3. Write a commit message in Conventional Commits format (`type(scope): summary`, e.g. `feat(auth): add token refresh`), based only on what is staged.
4. Run `git commit -m "<message>"` with that message.
5. Run `git push origin <current-branch>`, getting the branch name from `git branch --show-current`.
6. Run `gh pr create --fill` to open the pull request. `--fill` uses the commit message as the PR title and body.

Finish by showing the PR URL.
