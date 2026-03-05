# Workspace instructions for the `labs` monorepo

This repository is a _playground/monorepo_ containing several experimental apps and shared libraries. The content is intentionally varied, and no single architecture governs the whole project. Treat each package under `apps/` as a mostly self-contained demo, while `packages/` holds shared code (notably `@pontistudios/ui`).

## Top‑level tooling

- **Package manager**: [pnpm](https://pnpm.io/) with a workspace defined in `pnpm-workspace.yaml`.
- **Task runner**: [turbo](https://turborepo.org/) – root `package.json` scripts map to `turbo run <task>`.
- **Makefile** provides shortcuts (e.g. `make install`, `make build`, `make test`).
- **Hooks**: `lefthook.yml` runs format, lint, tests on commit/push.

### Common root commands

```bash
pnpm install          # bootstrap all workspaces
pnpm dev              # turbo run dev (persistent)
pnpm build            # turbo run build
pnpm lint             # turbo run lint
pnpm format           # turbo run format
pnpm test             # turbo run test
pnpm test:e2e:ci      # CI e2e suite across apps
pnpm test:update      # update golden snapshots
```

Run commands inside a specific package by `cd`‑ing into it or using `pnpm -r`/`turbo run` with `--filter`.

## Project structure

- `apps/` – each subdirectory is its own frontend/backend demo. Frameworks include Next.js, React Router, Cloudflare Pages, extensions, etc. 
  - Look for an `app/`, `src/`, or `pages/` directory to locate the main code.
  - Scripts in individual package.json files often provide `dev`, `build`, `lint`, `test`, etc.
- `packages/` – shared libraries. The most important is `@pontistudios/ui`, a UI component library built with Radix+Tailwind+CVA and Storybook.
- `openspec/` – repo for design/inspection work; not needed for most code tasks.
- `scripts/`, various tooling helpers used across the repo.

## Conventions & guidance

- **TypeScript**: Strict mode; `tsconfig.base.json` is extended by each package.
- **Styling**: Tailwind CSS everywhere, with CVA helpers for variant classes. Component files are PascalCase.
- **Routing**: Next.js pages in `apps/*` use usual file‑based routing. React Router apps have `routes.ts`/`react-router.config.ts`.
- **UI library**: Search `@pontistudios/ui` for shared components, utilities (`cn()`, `button.tsx`, etc.). Storybook (`packages/ui/.storybook`) contains examples.
- **Testing**: Vitest is the default unit/test runner; Playwright for E2E in Next apps. Look for `vite.config.ts` or `playwright.config.ts` in packages.
- **Databases**: Drizzle ORM is used with `drizzle-kit` commands (`migrate`, `generate`, etc.) in relevant apps. Prisma tools also appear.

## Development environment notes

- Environment variables are defined in `turbo.json`'s `globalEnv` and each app may require a local `.env` file.
- Use `pnpm exec <cmd>` to run binary from workspace context if necessary.

## How an AI assistant should behave

1. **Locate the relevant package** based on the user's description. Use `turbo run` with filters or change directories before running scripts.
2. **Run tests/builds appropriately**: invoke `pnpm test` at root for full suite, or `pnpm test` inside the package for faster feedback.
3. **Respect experimental nature**: there's no global invariants. When adding new features, check for around-the-corner inconsistencies (e.g. some apps use different lint configs).
4. **Search strategy**: often helpful to search across both `apps/` and `packages/`; UI components typically live in `@pontistudios/ui`.
5. **Formatting and linting**: run `pnpm format`/`pnpm lint` as part of changes. The repo uses custom `oxlint`/`oxfmt` commands.

> _Note_: If you need to modify or add repo‑wide instructions, update this file accordingly. For app‑specific behavior you may create additional instructions files and use `applyTo` patterns.

---

### Example prompts to try once instructions are active

- "Run the unit tests in the `manual-co` app and report any failures."
- "Add a new button component to `@pontistudios/ui` with CVA variants and update Storybook."
- "Format and lint the entire workspace." 


This should give the AI agent enough context to be immediately productive in the `labs` repository.