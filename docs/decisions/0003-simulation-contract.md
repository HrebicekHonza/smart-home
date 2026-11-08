# 0003 Simulation contract

- **Status:** accepted
- **Date:** 2026-11-08 (opened), 2026-11-08 (accepted)

## Context

The simulation core (room thermal model, on/off control with hysteresis, P and PI control with anti-windup, outdoor temperature and open window, time series, energy and comfort metrics) was written for the KKY/AKS semester paper. The first contract text was damaged; this record originally listed nine open questions.

## Decision

- The confirmed contract is [packages/simulation/README.md](../../packages/simulation/README.md). It answers all nine questions (controller construction and `Pmax`, sampling, initial state, reset, comfort band, overshoot, settling time, energy, open window).
- `packages/simulation` is the semester-paper core taken over unchanged in behaviour; names were translated to English and the tests moved to Vitest.
- Golden tests reproduce every metric the paper cites (`packages/simulation/test/golden.json`, tolerance 1e-6). The fixture is extracted from the paper's `vysledky.json` with `pnpm --filter @doma/simulation golden:update <path>`; regenerate it whenever the paper's inputs change (for example a measured radiator power instead of the 800 W estimate).
- The `/simulator` page shows simulation output only, labelled as a model result and never as a prediction for the real house or as demo data.

## Consequences

- Any change to the simulation core that alters the paper's numbers fails the golden tests.
- The app contains no other physics; demo history in the room detail stays labelled as demo data.
