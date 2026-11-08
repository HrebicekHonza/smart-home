---
name: add-gateway-adapter
description: Add or change a HomeGateway implementation in Doma (demo data, a future local service, real devices). Use when connecting a new source of measurements or a new way of sending commands.
---

# Add a gateway adapter

The `HomeGateway` port lives in `packages/core/src/ports/home-gateway.ts`. Screens and controllers depend only on that port.

## Steps

1. Read the port and the domain types it uses. If the adapter needs something the port lacks, extend the port in `packages/core` first, keeping it framework-independent, and update existing adapters.
2. Create the adapter in `apps/web/src/lib/adapters/<name>/`. It implements `HomeGateway` and sets `kind` honestly (`demo` or `live`).
3. Keep semantics strict:
   - `send()` resolves `accepted` or `rejected`. Acceptance is not confirmation.
   - Confirmation, failure and state changes arrive as `DomainEvent`s through `subscribe()`.
   - Every measurement carries the time it was measured; never refresh `measuredAt` without a new reading.
   - Demo adapters must never present their confirmations as device confirmations.
4. Wire the adapter only in the composition root `apps/web/src/lib/app/`. Routes, features and UI must not import it; ESLint enforces this.
5. Secrets and addresses come from runtime configuration of a future local service, never from client build variables or the repository.
6. Test the adapter against the port contract (accepted vs. confirmed, failure path, stale measurement), not its internals.
7. Run the `verify` skill.
