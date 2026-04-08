## 1. Preparation

- [x] 1.1 Verify no uncommitted changes in `apps/playground/`
- [x] 1.2 Backup or document current state

## 2. Merge routes.ts

- [x] 2.1 Review both routes.ts files for all route definitions
- [x] 2.2 Create merged routes.ts combining both (deduplicate identical routes)
- [ ] 2.3 Verify merged routes.ts parses correctly (blocked by pre-existing workspace conflict)

## 3. Handle Conflicting Files

- [x] 3.1 Keep main app's `app.css` (design token system)
- [x] 3.2 Keep main app's `root.tsx` (includes PrefetchProvider)
- [x] 3.3 Merge `env.ts` schemas (scratchpad OPENAI_API_KEY → VITE_OPENAI_API_KEY mapping)

## 4. Delete Duplicate Route Files

- [x] 4.1 Delete `scratchpad/routes/home.tsx` (keep main)
- [x] 4.2 Delete `scratchpad/routes/tfl.tsx` (keep main)
- [x] 4.3 Delete `scratchpad/routes/svg-glass-test.tsx` (keep main)
- [x] 4.4 Delete `scratchpad/routes/api.tfl.ts` (keep main)

## 5. Move Scratchpad-Unique Routes to Main App

- [x] 5.1 Move `scratchpad/routes/corona*.tsx` → `app/routes/`
- [x] 5.2 Move `scratchpad/routes/VectorSearchPage.tsx` → `app/routes/`
- [x] 5.3 Move `scratchpad/routes/to-do.tsx` → `app/routes/`
- [x] 5.4 Move `scratchpad/routes/api.covid*` → `app/routes/`
- [x] 5.5 Move `scratchpad/routes/infinite-header/` → `app/infinite-header-scratchpad/` (renamed - different implementation)
- [x] 5.6 Update imports in moved files to use correct component paths

## 6. Move Scratchpad-Unique Components

- [x] 6.1 Move `scratchpad/components/covid/` → `app/components/`
- [x] 6.2 Move `scratchpad/components/terminal/` → `app/components/`
- [x] 6.3 Move `scratchpad/components/country-picker/` → `app/components/`
- [x] 6.4 Update imports in moved components

## 7. Move Supporting Directories

- [x] 7.1 Move `scratchpad/lib/corona*` → `app/lib/`
- [x] 7.2 Move `scratchpad/lib/covid*` → `app/lib/`
- [x] 7.3 Move `scratchpad/db/` → `app/db/` (main app had no db)
- [x] 7.4 Move `scratchpad/types/corona*` → `app/types/`

## 8. Handle Component Name Collisions

- [x] 8.1 For each colliding component, verify main app version is complete
- [x] 8.2 Delete scratchpad versions that are duplicates or less complete
- [x] 8.3 Verify no imports break

## 9. Move Rust Directory to Repo Root

- [x] 9.1 Move `apps/playground/app/scratchpad/rust/` → `/Users/charlesponti/Developer/labs/rust/`
- [x] 9.2 Update any scripts referencing old path (e.g., `rrun.sh`) - rrun.sh uses relative paths, no update needed
- [ ] 9.3 Verify Rust files compile/run from new location

## 10. Delete Scratchpad Directory

- [x] 10.1 Verify all content has been migrated
- [x] 10.2 Delete `apps/playground/app/scratchpad/`
- [ ] 10.3 Verify app still builds and runs (blocked by pre-existing workspace conflict)

## 11. Verification

- [ ] 11.1 Run `npm run build` to verify no errors (blocked by pre-existing workspace conflict)
- [ ] 11.2 Manually test key routes work (home, /corona, /vector-search, /tfl)
- [ ] 11.3 Run tests if any exist
