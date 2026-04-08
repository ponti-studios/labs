## Why

The migrated experiments in `app/experiments/` are currently inaccessible to users. They exist as standalone files but aren't registered as routes, so there's no way to view or interact with them through the app's UI.

## What Changes

- Register React component experiments as routes in `routes.ts`
- Create a experiments index page listing all available experiments
- Add routes for interactive experiments: `data-agency`, `llm-receipt`, `threegl-image-gallery`
- The `dumphim.tsx` experiment uses `@github/spark/components` which may not be compatible - it will be noted as a separate consideration

## Capabilities

### New Capabilities

- `experiments-routes`: Expose migrated experiments as interactive routes in the playground app

### Modified Capabilities

<!-- No existing spec-level behavior changes -->

## Impact

- **Code**: `app/routes.ts` will have new route registrations
- **New File**: `app/routes/experiments.tsx` as an index page listing experiments
- **Dependencies**: Some experiments (dumphim.tsx) may need additional dependencies or may not be migratable to routes
