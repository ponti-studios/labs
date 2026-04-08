## Context

The `experiments-data` and `experiments-web` apps in `apps/` contain isolated experimental code snippets including:
- TypeScript utilities and algorithms (`generator.ts`, `calculate-marketing-spend.ts`, `effect.ts`)
- React components (`data-agency.tsx`, `llm-receipt.tsx`, `dumphim.tsx`)
- JavaScript experiments (`logarithm.js`, `inheritance.js`)
- HTML experiments (`threegl-web-request.html`, `bounce-toggle.html`, `keypress.html`)
- Data files (`countries.json`)

The `playground` app is an existing React Router application at `apps/playground/` with a structured layout including `app/components/`, `app/lib/`, `app/routes/`, and `app/data/` directories. It already has a scratchpad structure at `app/scratchpad/`.

## Goals / Non-Goals

**Goals:**
- Migrate all files from `experiments-data` and `experiments-web` into `playground` with appropriate organization
- Maintain code functionality after migration
- Preserve git history via git mv operations where possible
- Ensure playground continues to build and run after migration

**Non-Goals:**
- Refactoring or rewriting experiment code (preserve original implementations)
- Merging similar functionality (experiments remain as-is)
- Setting up new testing infrastructure

## Decisions

1. **Directory Structure**: Organize migrated files under `app/scratchpad/` or `app/experiments/` subdirectories
   - TypeScript/TSX files → `app/experiments/data/` and `app/experiments/web/`
   - HTML files → `public/experiments/`
   - JSON data files → `app/data/`
   - Pure JS files → `app/lib/` or `app/experiments/`

2. **Git History Preservation**: Use `git mv` for moved files to preserve history

3. **Import Resolution**: Update any relative imports that break after migration

4. **Entry Point Strategy**: HTML files in `public/` will be served as static assets, accessible at `/experiments/*.html`

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Broken imports after file relocation | Manual fix-up of imports post-migration |
| Missing dependencies in playground | Add required packages to playground package.json |
| Duplicate file names | Prefix with source app name (e.g., `experiments-data-generator.ts`) |
| Conflicting route definitions | Review and resolve any route conflicts |

## Migration Plan

1. **Audit Phase**: Inventory all files in `experiments-data/` and `experiments-web/`
2. **Package Check**: Identify any dependencies needed but missing in playground
3. **Directory Creation**: Create `app/experiments/data/` and `app/experiments/web/` directories
4. **File Migration**: 
   - Use `git mv` to relocate files
   - Handle conflicts by renaming
5. **Import Fixup**: Update any broken imports in migrated files
6. **Build Verify**: Run `npm run build` to confirm playground still works
7. **Cleanup**: Remove empty source directories
8. **Verify Experiments**: Test that migrated files are accessible

## Open Questions

- Should HTML experiments be converted to React Router routes or kept as static assets?
- Are any experiments outdated and should be archived instead of migrated?
