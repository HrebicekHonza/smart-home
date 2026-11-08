# 0001 Monorepo with a framework-independent core

- **Status:** accepted
- **Date:** 2026-11-08

## Context

The app starts as a static demo but will later talk to real devices through a local service. Screens and controllers must survive that change.

## Decision

- pnpm workspaces with `apps/web` (SvelteKit) and `packages/core` (pure TypeScript).
- `packages/core` exports TypeScript sources directly; there is no build step until a non-Vite consumer needs one.
- Devices are reached only through the `HomeGateway` port. Adapters are wired in a single composition root and provided through Svelte context instead of module-level singletons.
- Shared UI stays in `apps/web` until a second consumer exists.
- New packages are created only for real, current needs. `packages/simulation` is created when its contract is confirmed.

## Consequences

- Replacing the demo adapter does not touch screens.
- Lint rules guard the boundaries; violating them fails CI.
