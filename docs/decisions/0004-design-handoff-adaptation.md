# 0004 Adapting the Claude Design hand-off

- **Status:** accepted
- **Date:** 2026-11-08

## Context

The hand-off in `docs/Formulář pro design systém/design_handoff_doma` defines high-fidelity Overview and Room detail screens, tokens and a suggested code structure. Where it conflicts with the project's architecture, cleanliness of the project wins.

## Decisions

| Hand-off suggestion                                       | Implemented as                                                                    | Why                                                                       |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `packages/domain`, `packages/demo-data`, `HomeRepository` | `packages/core` with the `HomeGateway` port; demo data inside `lib/adapters/demo` | ADR 0001; no package without a second consumer                            |
| Domain events with Czech `title`/`detail`                 | Structured events; Czech text in `lib/presentation`                               | Domain stays language-independent                                         |
| `HourOfDay` as fractional hours, `Date` values            | `MinuteOfDay` integers and `EpochMillis`                                          | Exact arithmetic, serialisable snapshots                                  |
| Tiles, rows and alerts as `<button>`                      | Links (`<a>`) to the room route                                                   | They navigate; links keep native semantics and work without JavaScript    |
| Mode control as `radiogroup`                              | Toggle buttons with `aria-pressed`                                                | Each choice sends a command; arrow-key radio semantics would send several |
| Room selector as `tablist`                                | `nav` with links and `aria-current`                                               | Switching rooms changes the route                                         |
| Override validity chips with `role="radio"`               | Native radio inputs                                                               | Keyboard behaviour for free                                               |
| History dialog with a custom focus trap                   | Native `<dialog>` with `showModal()`                                              | Built-in focus trap, Esc, inert background and focus return               |
| Light switch changes immediately                          | Pending → confirmed through the gateway, like target changes                      | The hand-off recommends it for real devices; one model everywhere         |
| `--color-border-strong: #66707C` (claimed 3:1)            | `#68727E`                                                                         | Measured 2.98:1 against `surface`; nudged to 3.07:1                       |
| "Demo data, simulovaný průběh"                            | "Demo data, ukázkový průběh"                                                      | The demo history is not physics simulation output (ADR 0003)              |
| Static demo time 08:24                                    | Real clock; demo data generated relative to now                                   | Works at any time of day; E2E tests pin the clock                         |
| "Můj pokoj", "Pokoj"                                      | "Pokoj (kuchyň)", "Pokoj (chodba)"                                                | Owner's naming                                                            |

## Not implemented yet

- Room photos: none were supplied. The photo variant of the hero is ready and activated by `room.photoUrl`.
- Heating and Simulator screens: low-fidelity in the hand-off, shown as labelled placeholders.
- Desktop four-column favourites are implemented from 1440 px; mobile event count is not reduced to five.
