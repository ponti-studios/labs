## ADDED Requirements

### Requirement: All experiments-data files migrated

All source files from `apps/experiments-data/` SHALL be migrated to `apps/playground/app/experiments/data/` preserving file contents and functionality.

#### Scenario: TypeScript files migrated
- **WHEN** migration is executed
- **THEN** all `.ts` and `.tsx` files from `experiments-data/` exist at new location in `playground`

#### Scenario: JavaScript files migrated
- **WHEN** migration is executed
- **THEN** all `.js` files from `experiments-data/` exist at new location in `playground`

#### Scenario: JSON data files migrated
- **WHEN** migration is executed
- **THEN** all `.json` data files from `experiments-data/` exist in `playground/app/data/`

### Requirement: All experiments-web files migrated

All source files from `apps/experiments-web/` SHALL be migrated to `apps/playground/app/experiments/web/` or `apps/playground/public/experiments/` as appropriate.

#### Scenario: TypeScript files migrated
- **WHEN** migration is executed
- **THEN** all `.ts` files from `experiments-web/` exist at new location in `playground`

#### Scenario: HTML files migrated
- **WHEN** migration is executed
- **THEN** all `.html` files from `experiments-web/` exist at `playground/public/experiments/`

### Requirement: Git history preserved

Git history for migrated files SHALL be preserved using `git mv` operations.

#### Scenario: Git history check
- **WHEN** files are examined in git log after migration
- **THEN** history from original location is accessible

### Requirement: No duplicate file names

Migrated files with conflicting names SHALL be renamed to prevent overwrites.

#### Scenario: Name conflict resolution
- **WHEN** two files have the same base name from different source apps
- **THEN** at least one file is renamed with a prefix to ensure uniqueness

### Requirement: Playground builds successfully

The playground app SHALL build without errors after migration.

#### Scenario: Build verification
- **WHEN** `npm run build` is executed in playground
- **THEN** the build completes with exit code 0

### Requirement: Source directories removed

After successful migration and verification, the source directories `apps/experiments-data/` and `apps/experiments-web/` SHALL be removed.

#### Scenario: Source cleanup
- **WHEN** migration is verified complete and working
- **THEN** `apps/experiments-data/` and `apps/experiments-web/` directories no longer exist
