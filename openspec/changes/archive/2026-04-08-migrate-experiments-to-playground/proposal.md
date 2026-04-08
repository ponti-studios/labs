## Why

The `experiments-data` and `experiments-web` apps contain isolated experimental code snippets that have grown organically but lack proper integration. Migrating these into the existing `playground` app consolidates experimentation into a single location, reducing maintenance overhead and providing a unified development environment.

## What Changes

- Migrate all files from `apps/experiments-data/` into `apps/playground/`
- Migrate all files from `apps/experiments-web/` into `apps/playground/`
- Consolidate similar experiment types into organized directories within playground
- Remove deprecated `experiments-data` and `experiments-web` app directories
- Update any imports, references, and configuration to reflect new locations

## Capabilities

### New Capabilities

- `experiments-consolidation`: Migration of experimental code from multiple apps into a single playground directory structure

### Modified Capabilities

<!-- No existing spec-level behavior changes -->

## Impact

- **Code**: Files migrated from `apps/experiments-data/` and `apps/experiments-web/` to `apps/playground/`
- **Configuration**: Package.json, tsconfig, and build configs may need updates
- **Dependencies**: Consolidated node_modules management within playground
- **Removal**: `apps/experiments-data/` and `apps/experiments-web/` directories removed after successful migration
