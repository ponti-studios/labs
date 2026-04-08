## Why

The `playground/app/scratchpad/` directory is a nested React Router app with its own `root.tsx`, `routes.ts`, and `env.ts`. This creates unnecessary duplication and conceptual overhead. The playground should be a single unified React Router app that showcases all studio experiments, with the scratchpad's contents merged into the main `app/` directory. Additionally, the `rust/` directory for Rust experiments belongs at the repo root, not nested inside a React Router app.

## What Changes

- **Merge scratchpad into app**: Move all contents from `apps/playground/app/scratchpad/` into `apps/playground/app/`
- **Handle file collisions**: For conflicting files (`app.css`, `root.tsx`, `routes.ts`, `env.ts`), choose the main app version or merge based on need
- **Move rust/ to repo root**: Relocate `apps/playground/app/scratchpad/rust/` to `/Users/charlesponti/Developer/labs/rust/`
- **Consolidate routes**: Merge route definitions from both `routes.ts` files into a single `routes.ts`
- **Deduplicate routes**: Remove duplicate route files that exist in both directories
- **Merge or consolidate components**: Handle same-name components (Navigation, Sidebar, etc.) by keeping the main app version

## Capabilities

### New Capabilities
- `scratchpad-experiments`: The collection of experimental features previously in the scratchpad (COVID analytics, vector search, terminal component, etc.) are now integrated into the main playground app

### Modified Capabilities
<!-- No existing spec-level behavior changes -->

## Impact

- `apps/playground/app/` - main target of refactoring
- `apps/playground/app/scratchpad/` - to be deleted after merge
- `apps/playground/app/scratchpad/rust/` - moved to repo root
- Route configuration in `apps/playground/app/routes.ts`
- Component conflicts resolved (9 same-name components)
