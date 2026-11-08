# Doma

Personal smart-home application, starting with room heating. Runs locally at home; a landscape tablet is the primary device, phone and desktop stay fully usable. The UI is Czech, the repository is English.

> **Status:** first increment. Overview and room detail follow the approved design and run on a clearly labelled demo adapter (no hardware, account or cloud). Heating and Simulator screens are placeholders; see [docs/architecture.md](docs/architecture.md#roadmap).

## Requirements

- Node.js 26 LTS (exact version in [.nvmrc](.nvmrc))
- pnpm, version pinned by `packageManager` in [package.json](package.json) (pnpm switches to it automatically)

## Commands

| Command               | What it does                                  |
| --------------------- | --------------------------------------------- |
| `pnpm install`        | Install dependencies from the lockfile        |
| `pnpm dev`            | Start the web app in development mode         |
| `pnpm build`          | Build the static site into `apps/web/build`   |
| `pnpm preview`        | Serve the static build locally                |
| `pnpm check`          | Format check, lint, type check and unit tests |
| `pnpm test`           | Unit tests (Vitest) in all workspaces         |
| `pnpm test:e2e`       | Playwright tests against the static build     |
| `pnpm format`         | Format all files with Prettier                |
| `pnpm dropbox:ignore` | Exclude generated folders from Dropbox sync   |

First Playwright run needs a browser: `pnpm --filter @doma/web exec playwright install chromium`.

## Demo scenarios

Append `?demo=offline` (home server unreachable) or `?demo=loading` (data never arrives) to any URL to see those states. The first target change in each room fails on purpose so the failure and retry path is visible.

## Hosting under a sub-path

The static build works from any directory. Set `BASE_PATH` (see [.env.example](.env.example)) at build time, e.g. `BASE_PATH=/doma pnpm build`. Variables used by the client build are public; never put secrets into them.

## Repository layout

```
apps/web        SvelteKit app: routes, UI, application wiring
packages/core   Framework-independent domain types, rules and ports
docs/           Architecture and decision records
.claude/        Claude Code project settings and skills
```

## CI/CD

- **CI** ([ci.yml](.github/workflows/ci.yml)) runs on pull requests: install from lockfile, format check, lint, type check, unit tests, static build, Playwright.
- **Delivery** ([delivery.yml](.github/workflows/delivery.yml)) runs CI on every push to `master` and uploads the static build as a workflow artifact. A `v*` tag additionally publishes a GitHub Release with the zipped build.

Nothing is deployed to a public host.
