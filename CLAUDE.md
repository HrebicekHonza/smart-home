# Doma – rules for Claude

Personal smart-home app (heating first). Read [docs/architecture.md](docs/architecture.md) before changing structure.

## Commands

- `pnpm check` – format check, lint, type check, unit tests. Must pass before every commit.
- `pnpm test:e2e` – Playwright against the static build (served under `/doma`).
- `pnpm build` – static build. `pnpm dev` – dev server.
- Use the `verify` skill to run the full pipeline and report results.

## Architecture rules

- `packages/core`: framework-independent domain types, rules and ports. No Svelte, SvelteKit, DOM, network or storage.
- `apps/web`: routes and UI depend on the `HomeGateway` port, never on an adapter. Adapters are wired only in `src/lib/app` and provided through Svelte context. No module-level user state.
- Controllers return requested power from input values. They never call devices, stores, network or storage.
- No physics in the app. Simulation code comes from `packages/simulation` once its contract is confirmed ([ADR 0003](docs/decisions/0003-simulation-contract-pending.md)). Never present mock data as simulation output.
- Distinguish requested, confirmed (and by whom: demo or device), failed and stale states.
- Everything must work as a prerendered static site: no server endpoints, no secrets, internal links via `resolve()` from `$app/paths`, imports via `#lib/...`.
- Do not add packages, abstractions or features for hypothetical needs. A new workspace package requires a real consumer.

## Code conventions

- English everywhere except user-facing text, which is Czech (°C, 24-hour time, decimal comma via `#lib/format`).
- No comments unless something genuinely cannot be expressed in code. Prefer clear names.
- TypeScript strict; no `any`, no non-null assertions.
- SOLID, KISS, DRY. Small modules with one reason to change.
- Design tokens only from `apps/web/src/lib/styles/tokens.css`; no hard-coded colours in components.
- Accessibility: keyboard reachable, visible focus, touch targets at least 48 px, respect reduced motion.
- Tests check behaviour and domain rules, not implementation details. Unit tests sit next to the code (`*.test.ts`), E2E tests in `apps/web/e2e`.
- Pin exact dependency versions; commit `pnpm-lock.yaml`.

## Workflow

- `master` is the main branch. Work on `feat/…`, `fix/…`, `chore/…` branches and merge through pull requests with green CI.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`).
- Record significant decisions as ADRs in `docs/decisions/`.
- No real addresses, tokens or passwords in the repo; demo data is anonymous. `.env.example` holds placeholders only.
- The working copy lives in Dropbox. After creating new generated folders, run `pnpm dropbox:ignore`.
