---
name: implement-design
description: Turn a Claude Design hand-off (screens, components, tokens) into Doma's SvelteKit UI. Use when the user supplies an approved design or asks to align the UI with it.
---

# Implement a design

The approved design is the source of truth for look and layout. Architecture rules in `CLAUDE.md` still apply.

## Steps

1. Read the whole hand-off first. List screens, components, states (loading, empty, stale, pending, failed, demo) and tokens it defines. Ask about anything ambiguous that changes what gets built; do not invent screens the design does not show.
2. Tokens first: update `apps/web/src/lib/styles/tokens.css` only. Components use Tailwind utilities generated from tokens (`bg-surface`, `text-text-secondary`, `rounded-card`) or `var(--…)`, never raw colour values.
3. Update the contrast pairs in `apps/web/src/lib/styles/tokens.test.ts` to match the combinations the design actually uses, then run the tests.
4. Build shared primitives in `apps/web/src/lib/ui/` only when used by at least two features; otherwise keep them inside the feature.
5. Keep the UI Czech with `#lib/format` helpers for °C, decimal comma and 24-hour time. Measured and target temperature must be visually distinct.
6. Verify landscape tablet (1280×800), phone and desktop; keyboard focus, touch targets of at least 48 px and reduced motion.
7. Photos of rooms are optional; every screen must work without them.
8. Run the `verify` skill and extend Playwright scenarios when a main flow changes.
