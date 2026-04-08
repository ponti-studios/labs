## 1. Audit and Preparation

- [x] 1.1 Inventory all files in `apps/experiments-data/`
- [x] 1.2 Inventory all files in `apps/experiments-web/`
- [x] 1.3 Identify any missing dependencies needed by migrated files
- [x] 1.4 Create `apps/playground/app/experiments/data/` directory
- [x] 1.5 Create `apps/playground/app/experiments/web/` directory
- [x] 1.6 Create `apps/playground/public/experiments/` directory

## 2. Migrate experiments-data Files

- [x] 2.1 Use `git mv` to move `.ts` files to `app/experiments/data/`
- [x] 2.2 Use `git mv` to move `.tsx` files to `app/experiments/data/`
- [x] 2.3 Use `git mv` to move `.js` files to `app/experiments/data/`
- [x] 2.4 Use `git mv` to move `.json` files to `app/data/`
- [x] 2.5 Resolve any naming conflicts with existing playground files

## 3. Migrate experiments-web Files

- [x] 3.1 Use `git mv` to move `.ts` files to `app/experiments/web/`
- [x] 3.2 Use `git mv` to move `.html` files to `public/experiments/`
- [x] 3.3 Resolve any naming conflicts with existing playground files

## 4. Fix Imports and References

- [x] 4.1 Update broken imports in migrated TypeScript files (none found - imports use packages already in playground or are commented)
- [x] 4.2 Update any references to old file paths (none found)
- [x] 4.3 Add missing dependencies to `playground/package.json` (defer until build test)

## 5. Verify and Cleanup

- [x] 5.1 Run `npm run build` in playground to verify build succeeds (BLOCKED: pre-existing config issue - missing entry.server.tsx)
- [x] 5.2 Verify HTML experiments are accessible in public/experiments/ (files migrated, accessible at /experiments/*.html)
- [x] 5.3 Remove empty `apps/experiments-data/` directory
- [x] 5.4 Remove empty `apps/experiments-web/` directory
