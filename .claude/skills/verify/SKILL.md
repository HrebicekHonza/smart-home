---
name: verify
description: Run the full Doma verification pipeline (format, lint, types, unit tests, static build, Playwright) and report real results. Use before committing, before opening a pull request, or whenever asked whether the project passes.
---

# Verify

Run each step from the repository root and stop at the first failure only if later steps depend on it.

1. `pnpm install --frozen-lockfile`
2. `pnpm format:check`
3. `pnpm lint`
4. `pnpm typecheck`
5. `pnpm test`
6. `pnpm build`
7. `pnpm test:e2e` (first run on a machine: `pnpm --filter @doma/web exec playwright install chromium`)

## Report

- List every step with its actual outcome: passed, failed (with the relevant error lines), or skipped (and why).
- Never claim a step passed without running it in this session.
- On a formatting failure, run `pnpm format` and re-run the check instead of editing by hand.
- If a failure is not caused by the current change, say so rather than patching around it.
