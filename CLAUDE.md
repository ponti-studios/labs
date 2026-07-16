# Agent Rules — Ponti Studios Labs

Read `AGENTS.md` for the repository-wide instructions.

## Storybook Development Only

Storybook is used only as a local development environment in this repository.

- Never run `storybook build`, `build-storybook`, or any equivalent production Storybook export.
- Use `pnpm --filter @ponti-studios/ui storybook` for local Storybook validation.
- Do not add static Storybook builds to CI, package scripts, deployment steps, or validation workflows.
