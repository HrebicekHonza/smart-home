# 0005 Public simulator on GitHub Pages

- **Status:** accepted
- **Date:** 2026-11-09
- **Amends:** [0002](0002-delivery-without-public-hosting.md)

## Context

The simulator belongs to the author's semester paper (KKY/AKS) and needs a public link. The repository holds no personal data yet, so it is made public; GitHub Pages is free only for public repositories. The rest of the app (overview, rooms, heating) must not be published.

## Decision

- A build-time edition flag `VITE_EDITION=simulator` produces a simulator-only site: the root redirects to `/simulator/`, the navigation shell is replaced by a minimal header, and no other page is prerendered.
- [pages.yml](../../.github/workflows/pages.yml) builds that edition on every push to `master` and deploys it to GitHub Pages under `/<repository>/`.
- The Simulator page explains what it shows and where it comes from; in the public edition the explanation is expanded by default.
- The default build is unchanged and ADR 0002 still governs it.

## Consequences

Making the repository private again disables Pages on a free account and breaks the published link.
