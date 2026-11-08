# Architecture

## Goals

- A long-lived personal product, extended in small increments without premature complexity.
- Real hardware, a backend or a database can be added later without rewriting screens or controllers.
- The static demo works without servers, accounts, secrets or cloud services.

## Module boundaries

```
apps/web ──depends on──▶ packages/core
```

| Module                                  | Owns                                                                                               | Must not                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `packages/core`                         | Domain types, units, pure rules (effective target, room status, alerts, schedule, override), ports | Import Svelte, SvelteKit, browser APIs, network or storage |
| `apps/web` `lib/app`                    | Composition root: picks the gateway, creates `HomeState`, provides it through Svelte context       | Hold user state in module-level singletons                 |
| `apps/web` `lib/adapters`               | `HomeGateway` implementations (now: `demo`)                                                        | Be imported from routes, features or UI                    |
| `apps/web` `lib/state`                  | `HomeState`: snapshot, drafts, command states, toast. Talks to the port only                       | Contain domain rules or Czech copy beyond toast messages   |
| `apps/web` `lib/presentation`           | Czech labels, icons and tones for domain values                                                    | Hold state                                                 |
| `apps/web` `lib/features/*`, `lib/ui`   | Feature components (`overview`, `room`) and shared primitives used by at least two features        | Import adapters; compute domain rules themselves           |
| `packages/simulation` (not yet created) | Thermal model, controllers, metrics. Delivered by another agent once its contract is confirmed     | Depend on UI, devices, stores, network or storage          |

ESLint (`no-restricted-imports` in [eslint.config.js](../eslint.config.js)) enforces the core and adapter boundaries.

### Separation of concerns

1. **Physical model and calculations** live only in `packages/simulation`. The app contains no parallel physics. Demo history curves are labelled as demo data, never as simulation output.
2. **Controllers** take input values and return requested power in watts. They never call devices, stores, network or storage.
3. **Measurement sources and commands** go through the `HomeGateway` port. `send()` resolves only after the device side confirmed or failed the command; the UI never updates optimistically.
4. **UI** renders state from `HomeState` and sends commands through it.

### Domain conventions

- Units: time in seconds, temperature in °C, power in W, heat capacity in J/K, thermal resistance in K/W. Timestamps are epoch milliseconds (`EpochMillis`), times of day are minutes (`MinuteOfDay`) in the home's local time zone.
- Target priority: active manual override → mode (`away` = 17 °C, `night` = schedule value at midnight) → schedule.
- Room status priority: offline thermostat → stale measurement (> 30 min) → open window → heating (< target − 0,2) / above (> target + 0,5) / ok.
- Staleness and status are derived, never stored. Events are structured; Czech text is produced in `lib/presentation`.

## Routes

| Route             | Content                                                                               |
| ----------------- | ------------------------------------------------------------------------------------- |
| `/`               | Overview: mode, alerts, favourite and other rooms, lights, boiler, events             |
| `/mistnosti/[id]` | Room detail; `?historie=24h\|7d` opens the history dialog (shareable, Back closes it) |
| `/vytapeni`       | Placeholder until the screen is designed                                              |
| `/simulator`      | Placeholder until the simulation contract is confirmed                                |

Room pages are prerendered from the demo room ids exposed by the composition root. `?demo=offline` and `?demo=loading` switch the demo gateway into the corresponding scenario.

## Static delivery

- `@sveltejs/adapter-static` with every page prerendered and `trailingSlash: 'always'`, so each page is `…/index.html` and subpages open directly from any static server.
- `paths.relative` plus `BASE_PATH` support hosting under a sub-directory. Internal links and `goto()` use `resolve()` from `$app/paths`.
- Fonts (Manrope, Geist Mono, OFL licences alongside the files) and assets are bundled locally; there is no runtime CDN dependency.

## Design system

The approved Claude Design hand-off lives in [docs/Formulář pro design systém](<Formulář pro design systém/design_handoff_doma/README.md>). Its tokens are in one file, [tokens.css](../apps/web/src/lib/styles/tokens.css), as a Tailwind `@theme`, available both as utilities (`bg-surface`, `text-value-xl`) and as CSS custom properties. A unit test checks WCAG AA contrast of the colour pairs actually used. Deviations from the hand-off are recorded in [ADR 0004](decisions/0004-design-handoff-adaptation.md).

## Future placement

| Concern                   | Planned place                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| Continuous device control | A local service independent of the open browser. The control loop never runs in the UI lifecycle. |
| Backend                   | `adapter-node` or a separate service (NestJS is a candidate); not chosen yet                      |
| Real devices              | A new `HomeGateway` adapter wired in the composition root                                         |
| Persistence               | Owned by the future local service; not chosen yet                                                 |

## Roadmap

1. ✅ Monorepo, tooling, CI/CD, design tokens, app shell
2. ✅ Overview, room detail, target changes, open window, events and history through the demo adapter
3. Heating screen once it is designed
4. Simulation integration once the contract is confirmed ([ADR 0003](decisions/0003-simulation-contract-pending.md))

Schedule editing, energy and AI strategies come later and are not prepared in code.

## Decisions

See [docs/decisions](decisions/).
