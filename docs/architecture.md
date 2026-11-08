# Architecture

## Goals

- A long-lived personal product, extended in small increments without premature complexity.
- Real hardware, a backend or a database can be added later without rewriting screens or controllers.
- The static demo works without servers, accounts, secrets or cloud services.

## Module boundaries

```
apps/web ──depends on──▶ packages/core
```

| Module                                  | Owns                                                                                           | Must not                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `packages/core`                         | Domain types, units, pure domain rules, ports (`HomeGateway`)                                  | Import Svelte, SvelteKit, browser APIs, network or storage |
| `apps/web` routes / UI                  | Pages, components, presentation formatting                                                     | Import adapters directly; contain domain rules or physics  |
| `apps/web` `lib/app`                    | Composition root: picks the gateway implementation and provides it via Svelte context          | Hold user state in module-level singletons                 |
| `apps/web` adapters                     | `HomeGateway` implementations (first: demo)                                                    | Be imported from routes, features or UI                    |
| `packages/simulation` (not yet created) | Thermal model, controllers, metrics. Delivered by another agent once its contract is confirmed | Depend on UI, devices, stores, network or storage          |

ESLint (`no-restricted-imports` in [eslint.config.js](../eslint.config.js)) enforces the core and adapter boundaries.

### Separation of concerns

1. **Physical model and calculations** live only in `packages/simulation`. The app contains no parallel physics.
2. **Controllers** take input values and return requested power in watts. They never call devices, stores, network or storage.
3. **Measurement sources and commands** go through the `HomeGateway` port. A command result of `accepted` is not a confirmation; confirmation arrives as a domain event from the gateway.
4. **UI** renders state and sends commands through the port.

### Domain conventions

- Units: time in seconds, temperature in °C, power in W, heat capacity in J/K, thermal resistance in K/W. Timestamps are epoch milliseconds (`EpochMillis`).
- Measurements carry `measuredAt`; staleness is derived with `isStale`, never stored.
- A setpoint holds the confirmed value plus an optional request (`pending` or `failed`). Demo confirmations must be labelled as demo, never as a confirmed device state.

## Static delivery

- `@sveltejs/adapter-static` with every page prerendered and `trailingSlash: 'always'`, so each page is `…/index.html` and subpages open directly from any static server.
- `paths.relative` plus `BASE_PATH` support hosting under a sub-directory. Internal links use `resolve()` from `$app/paths`.
- Fonts (Manrope, OFL licence alongside the files) and assets are bundled locally; there is no runtime CDN dependency.

## Design system

Colour, font and radius tokens live in one file, [tokens.css](../apps/web/src/lib/styles/tokens.css), as a Tailwind `@theme`. They are available both as utilities (`bg-surface`) and as CSS custom properties (`var(--color-surface)`). A unit test checks WCAG AA contrast of the colour pairs actually used. The final screen design comes from Claude Design; the current shell is a deliberately plain baseline.

## Future placement

| Concern                   | Planned place                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| Continuous device control | A local service independent of the open browser. The control loop never runs in the UI lifecycle. |
| Backend                   | `adapter-node` or a separate service (NestJS is a candidate); not chosen yet                      |
| Real devices              | A new `HomeGateway` adapter wired in the composition root                                         |
| Persistence               | Owned by the future local service; not chosen yet                                                 |

## Roadmap

1. ✅ Monorepo, tooling, CI/CD, design tokens, app shell, simulator placeholder
2. Overview of four demo rooms and the demo adapter
3. Room detail with target temperature changes through the demo adapter
4. Open-window state and the event history
5. Simulation integration once the contract is confirmed ([ADR 0003](decisions/0003-simulation-contract-pending.md))

Schedules, energy and AI strategies come later and are not prepared in code.

## Decisions

See [docs/decisions](decisions/).
