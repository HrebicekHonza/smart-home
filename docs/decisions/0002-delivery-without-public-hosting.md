# 0002 Delivery as build artifacts and releases

- **Status:** accepted
- **Date:** 2026-11-08

## Context

The repository is private and the app runs at home. Public hosting (e.g. GitHub Pages) is not wanted. Paid services are excluded.

## Decision

- CI runs on pull requests and is reused by the delivery workflow.
- Every push to `master` runs CI and uploads the static build as a workflow artifact (30 days).
- A `v*` tag publishes a GitHub Release with the zipped static build.
- `workflow_dispatch` allows a manual run.

## Deferred

Deployment to a home device (self-hosted runner, or the device pulling the latest release) is decided once that device exists.
