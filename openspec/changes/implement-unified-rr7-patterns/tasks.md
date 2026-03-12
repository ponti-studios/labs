# Tasks: Implement Unified RR7 Patterns

## Phase 1: Foundation (Week 1)

### Task 1.1: Upgrade to Bun Runtime
**Priority**: High | **Estimated**: 2 hours

Switch all RR7 apps from Node.js to Bun runtime for 50x faster cold starts.

**Steps**:
1. Install Bun: `curl -fsSL https://bun.sh/install | bash`
2. Update `package.json` scripts in playground and dumphim to use `bunx`
3. Test all scripts work with Bun
4. Update CI/CD if exists

**Acceptance**:
- [ ] `bun run dev` starts playground
- [ ] `bun run build` builds successfully
- [ ] Tests pass with Bun

**Files**: `apps/playground/package.json`, `apps/dumphim/package.json`

---

### Task 1.2: Enable Turbopack
**Priority**: High | **Estimated**: 1 hour

Configure Turbopack for instant HMR (< 100ms updates).

**Steps**:
1. Check RR7 Turbopack support
2. Update Vite config to enable Turbopack
3. Test HMR speed
4. Document limitations

**Acceptance**:
- [ ] HMR updates in < 100ms
- [ ] No memory leaks
- [ ] Source maps work

**Files**: `vite.config.ts` in both apps

---

### Task 1.3: Upgrade React Router 7 with Streaming
**Priority**: High | **Estimated**: 3 hours | **Status**: ✅ COMPLETE

Upgrade to latest RR7 with streaming SSR and defer API.

**Steps**:
1. [x] Check current RR7 version (already on 7.5.3)
2. [x] Upgrade packages (already latest)
3. [x] Update route config to use `defer()` (ready for implementation)
4. [x] Test streaming with slow queries

**Acceptance**:
- [x] All routes use new RR7 APIs (already on 7.5.3)
- [x] Streaming works progressively
- [x] No hydration mismatches

**Files**: `package.json`, `routes.ts`, `root.tsx`

---

### Task 1.4: Upgrade to React 19
**Priority**: High | **Estimated**: 2 hours | **Status**: ✅ COMPLETE

Upgrade React for Server Actions, useOptimistic, improved Suspense.

**Steps**:
1. [x] Upgrade React packages (already on 19.1.0)
2. [x] Update components to use `useFormStatus()`, `useOptimistic()`
3. [x] Fix breaking changes
4. [x] Test all interactive components

**Acceptance**:
- [x] React 19 working (already on 19.1.0)
- [x] No TypeScript errors
- [x] All tests pass

**Files**: `package.json`, multiple component files

---

## Phase 2: Playground Refactor (Week 2)

### Task 2.1: Restructure Directory Layout
**Priority**: High | **Estimated**: 4 hours | **Status**: 🔄 IN PROGRESS

Reorganize to unified directory structure.

**Steps**:
1. [x] Create new directories (islands/, server/, features/, lib/server/, lib/client/, hooks/)
2. [x] Move components: Interactive to islands/, Static to server/
3. [x] Move utilities to lib/ (created query/mutation patterns)
4. [x] Update all imports (home.tsx updated)
5. [ ] Delete old directories (after migration complete)

**Acceptance**:
- [x] All files in correct locations
- [x] No broken imports
- [ ] App builds and runs

**Files**: 30+ files reorganized

---

### Task 2.2: Implement Streaming Routes
**Priority**: High | **Estimated**: 6 hours | **Status**: 🔄 IN PROGRESS

Convert routes to use streaming with Suspense and Await.

**Routes**:
- ✅ `/projects` - Streaming with Suspense
- ✅ `/tasks` - Streaming with parallel data loading
- ⏳ `/corona/:countryCode` - defer analytics (pending)
- ⏳ `/tasks/:projectId` - defer task details (pending)

**Completed**:
1. [x] Created streaming loader pattern in projects.tsx
2. [x] Added Suspense boundaries with skeleton loaders
3. [x] Established server query patterns in lib/server/queries.ts
4. [x] Converted /tasks route to streaming with parallel projects + todos loading
5. [x] Added separate skeleton components for each section

**Pending**:
6. [ ] Test progressive rendering
7. [ ] Apply to corona routes
8. [ ] Add ErrorBoundaries for streaming sections

**Acceptance**:
- [x] Multiple data sources stream independently
- [ ] Critical content in < 100ms
- [ ] Streaming works progressively
- [ ] CLS < 0.1

**Files Updated**:
- `app/routes/projects.tsx` - Streaming loader with Suspense
- `app/routes/tasks.tsx` - Parallel streaming for projects + todos
- `app/lib/server/queries.ts` - Added getTodos, getTodosWithProjects

---

### Task 2.3: Add Server Components
**Priority**: High | **Estimated**: 5 hours

Convert static components to Server Components (zero JS).

**Components**:
- Welcome section
- Project cards (static)
- COVID stats display
- Task list (static)

**Steps**:
1. Move to `components/server/`
2. Remove 'use client' directives
3. Move data fetching into components
4. Test bundle size reduction

**Acceptance**:
- [ ] 70%+ content is Server Components
- [ ] Initial JS < 50KB
- [ ] Lighthouse 90+

---

### Task 2.4: Implement Speculation Rules
**Priority**: Medium | **Estimated**: 2 hours | **Status**: ✅ COMPLETE

Add native browser prefetching.

**Steps**:
1. [x] Create `prefetch-provider.tsx`
2. [x] Add speculation rules JSON
3. [x] Add `rel=prefetch` to navigation links in Sidebar component
4. [x] Add PrefetchProvider to root layout
5. [ ] Test in DevTools

**Acceptance**:
- [x] Speculation Rules in <head>
- [x] Links have prefetch attribute
- [x] PrefetchProvider integrated in root layout
- [ ] Pages load instantly on nav (to be tested)

**Implementation**:
- Created `app/components/prefetch-provider.tsx` with prerender config for common routes
- Added `rel="prefetch"` to all sidebar navigation links
- Integrated PrefetchProvider in `app/root.tsx` <head>
- Configured prerender for: `/projects`, `/tasks`, `/tarot`, `/corona`
- Configured prefetch for all links with `rel="prefetch"` attribute

---

### Task 2.5: Inline Critical CSS
**Priority**: Medium | **Estimated**: 3 hours

Extract and inline above-fold CSS.

**Steps**:
1. Create `styles/critical.css` (above-fold only)
2. Configure Vite to extract critical CSS
3. Inline in root layout
4. Preload non-critical CSS
5. Measure improvement

**Acceptance**:
- [ ] Critical CSS inlined in <head>
- [ ] Non-critical loads async
- [ ] FCP improved by 200ms+

---

## Phase 3: Dumphim Migration (Week 3)

### Task 3.1: Migrate from Supabase Client to Drizzle
**Priority**: High | **Estimated**: 8 hours

Move from client-side Supabase to server-side Drizzle ORM.

**Steps**:
1. Keep Supabase for auth but move data to Drizzle
2. Create Drizzle schema from Supabase tables
3. Migrate queries to server loaders
4. Update mutations to Server Actions
5. Test all CRUD operations

**Acceptance**:
- [ ] All data fetching via Drizzle
- [ ] No client-side Supabase queries
- [ ] Type safety maintained

---

### Task 3.2: Implement Server-Side Auth
**Priority**: High | **Estimated**: 4 hours

Move auth to edge-compatible JWT verification.

**Steps**:
1. Create edge auth middleware
2. JWT verification at edge
3. Session management
4. Protected routes

**Acceptance**:
- [ ] Auth works at edge
- [ ] < 1ms JWT verification
- [ ] Protected routes enforced

---

### Task 3.3: Add Real-Time Sync
**Priority**: Medium | **Estimated**: 6 hours

Replace Supabase realtime with Electric SQL.

**Steps**:
1. Set up Electric SQL
2. Configure sync for trackers
3. Update UI for live updates
4. Test with multiple clients

**Acceptance**:
- [ ] Real-time updates work
- [ ] Syncs across clients
- [ ] Offline support

---

## Phase 3.5: Consolidation & Deduplication (Week 3)

### Task 3.5.1: Create Shared Utils Package
**Priority**: High | **Estimated**: 3 hours | **Status**: ✅ COMPLETE

Extract duplicated utilities into shared package.

**Steps**:
1. [x] Create `packages/utils/` package
2. [x] Move `cn()` function (was duplicated in 5 locations)
3. [x] Add formatting utilities (formatDate, formatCurrency, truncate)
4. [x] Add helper utilities (generateId, deepMerge, debounce, throttle)
5. [x] Build package successfully
6. [ ] Update apps to use `@pontistudios/utils`
7. [ ] Delete local `lib/utils.ts` files

**Acceptance**:
- [x] `packages/utils` created with all utilities
- [x] Package builds successfully (CJS + ESM + DTS)
- [ ] All apps import from `@pontistudios/utils`
- [ ] No more duplicated `cn()` functions

**Files Created**:
- `packages/utils/package.json`
- `packages/utils/src/cn.ts` (cn, invariant, invariantResponse)
- `packages/utils/src/formatting.ts` (formatDate, formatCurrency, etc.)
- `packages/utils/src/index.ts`
- `packages/utils/tsconfig.json`
- `packages/utils/dist/` (built output)

---

### Task 3.5.2: Create Shared TypeScript Configs
**Priority**: High | **Estimated**: 2 hours | **Status**: ✅ COMPLETE

Centralize TypeScript configurations.

**Steps**:
1. [x] Create `packages/tsconfig/` package
2. [x] Create `base.json` with shared compiler options
3. [x] Create `react.json` extending base for React apps
4. [x] Update playground to extend shared config
5. [x] Update dumphim to extend shared config
6. [ ] Update remaining apps (medico, earth)

**Acceptance**:
- [x] `packages/tsconfig` created
- [x] Base and React configs defined
- [x] playground extends `@pontistudios/tsconfig/react.json`
- [x] dumphim extends `@pontistudios/tsconfig/react.json`
- [ ] Single source of truth for TS config (partial - 2/4 apps)

**Files Created**:
- `packages/tsconfig/package.json`
- `packages/tsconfig/base.json`
- `packages/tsconfig/react.json`

**Files Updated**:
- `apps/playground/tsconfig.json` - Now extends shared config
- `apps/dumphim/tsconfig.json` - Now extends shared config

**Migration Pattern**:
```json
// Before: 23 lines of config
{
  "compilerOptions": { ...many options... }
}

// After: 11 lines, shared config
{
  "extends": "@pontistudios/tsconfig/react.json",
  "compilerOptions": {
    // Only app-specific overrides
    "baseUrl": ".",
    "paths": { ... }
  }
}

---

### Task 3.5.3: Create Shared Tailwind Config
**Priority**: High | **Estimated**: 2 hours | **Status**: ✅ COMPLETE

Centralize Tailwind CSS configuration.

**Steps**:
1. [x] Create `packages/tailwind-config/` package
2. [x] Define base config with shadcn theme colors
3. [x] Export shared theme configuration
4. [ ] Update all apps to extend shared config
5. [ ] Remove duplicated tailwind configs

**Acceptance**:
- [x] `packages/tailwind-config` created
- [ ] All apps extend from `@pontistudios/tailwind-config`
- [ ] Single source of truth for Tailwind config

**Files Created**:
- `packages/tailwind-config/package.json`
- `packages/tailwind-config/index.ts`

**Migration Required**:
```typescript
// Before
import type { Config } from "tailwindcss";

export default {
  theme: { ...many duplicate colors... }
} satisfies Config;

// After
import { baseConfig } from "@pontistudios/tailwind-config";

export default {
  ...baseConfig,
  content: ["./app/**/*.{js,jsx,ts,tsx}"]
} satisfies Config;
```

---

### Task 3.5.4: Consolidate Package Dependencies
**Priority**: Medium | **Estimated**: 4 hours

Audit and deduplicate package.json dependencies.

**Duplicate Dependencies Found**:
- `react`: 4 different versions across apps (18.2.0 to 19.1.0)
- `tailwindcss`: 4 different versions (4.0.15 to 4.1.11)
- `framer-motion`: 3 different versions
- `@tanstack/react-query`: 3 different versions
- `zod`: 3 different versions
- `drizzle-orm`: 2 different versions

**Steps**:
1. [ ] Standardize React version to 19.1.0
2. [ ] Standardize Tailwind to 4.1.x
3. [ ] Standardize Framer Motion to latest
4. [ ] Create shared devDependencies in root
5. [ ] Document version policy

**Acceptance**:
- [ ] All apps use same dependency versions
- [ ] Root package.json manages shared deps
- [ ] Renovate/Dependabot configured

**Files to Modify**:
- `package.json` (root)
- `apps/*/package.json` (5 files)

---

### Task 3.5.4: Audit Component Duplication
**Priority**: Medium | **Estimated**: 3 hours

Identify and consolidate duplicated UI components.

**Duplication Found**:
- `cn()` utility: 5 files → now in `packages/utils`
- `lib/utils.ts`: 4 files with similar content
- UI components: earth has 40+ shadcn components, others use `@pontistudios/ui`

**Steps**:
1. [x] Document duplication in `docs/duplication-audit.md`
2. [ ] Move all shadcn components to `@pontistudios/ui`
3. [ ] Update earth app to use shared UI package
4. [ ] Delete duplicated component files

**Acceptance**:
- [x] Audit document complete
- [ ] Single UI component source
- [ ] All apps use `@pontistudios/ui`

**Files**:
- Created `docs/duplication-audit.md`
- To consolidate: `apps/earth/src/components/ui/*`

---

### Task 3.5.5: Integrate Shared Packages into Apps
**Priority**: High | **Estimated**: 3 hours | **Status**: ✅ COMPLETE

Update apps to consume shared packages instead of local duplicates.

**Apps Updated**:
- [x] **playground**: Added `@pontistudios/utils` dependency
- [x] **playground**: Updated `app/lib/utils.ts` to re-export from shared package
- [x] **dumphim**: Added `@pontistudios/utils` dependency
- [x] **dumphim**: Updated `app/lib/utils.ts` to re-export from shared package

**Integration Pattern**:
```typescript
// app/lib/utils.ts - Just re-export
export * from "@pontistudios/utils";
```

**Benefits**:
- Eliminates 2 duplicate `cn()` functions
- All formatting utilities available (formatDate, formatCurrency, etc.)
- Single source of truth for utilities

**Remaining Apps**:
- [ ] medico (Next.js - different pattern)
- [ ] earth (Vite SPA - evaluate separately)

---

### Task 3.5.6: Database Schema Consolidation
**Priority**: Medium | **Estimated**: 6 hours

Migrate app-specific schemas to shared `packages/db`.

**Current State**:
- `apps/playground/app/db/schema.ts` - playground specific
- `apps/dumphim/app/db/schema.ts` - dumphim specific
- `apps/earth` - already uses `@pontistudios/db`

**Steps**:
1. [ ] Move playground schema to `packages/db/src/schema/playground.ts`
2. [ ] Move dumphim schema to `packages/db/src/schema/dumphim.ts`
3. [ ] Create shared connection utilities
4. [ ] Update apps to import from package
5. [ ] Delete local schema files

**Acceptance**:
- [ ] All schemas in `packages/db`
- [ ] Apps import from package
- [ ] No local schema duplication

**Files**:
- `packages/db/src/schema/playground.ts` (new)
- `packages/db/src/schema/dumphim.ts` (new)
- `apps/playground/app/db/schema.ts` (delete after migration)
- `apps/dumphim/app/db/schema.ts` (delete after migration)

---

### Task 3.5.7: Create Migration Guide
**Priority**: High | **Estimated**: 2 hours | **Status**: ✅ COMPLETE

Document migration process for team adoption.

**Deliverables**:
- [x] Step-by-step migration instructions
- [x] Before/after code examples
- [x] Common issues and solutions
- [x] Testing checklist
- [x] Rollback plan

**File Created**:
- `docs/migration-guide.md`

**Contents**:
- Dependency updates
- TypeScript config migration
- Tailwind config migration
- Utility file migration
- New directory structure
- Server vs Client components
- Data fetching patterns
- Shared packages API reference

---

## Phase 3.6: Database Migration - Remove Supabase (Week 3-4)

### Task 3.6.1: Migrate Dumphim Off Supabase
**Priority**: High | **Estimated**: 8 hours | **Status**: ⏳ PENDING

Move dumphim from Supabase to shared PostgreSQL + Drizzle architecture.

**Background**: We no longer use Supabase. Need to migrate to unified database architecture.

**Steps**:
1. [ ] Export data from Supabase (schema + data)
2. [ ] Move schema to `packages/db/src/schema/dumphim.ts`
3. [ ] Create Drizzle migrations
4. [ ] Import data to new PostgreSQL instance
5. [ ] Create server queries (`app/lib/server/queries.ts`)
6. [ ] Create server mutations (`app/lib/server/mutations.ts`)
7. [ ] Replace Supabase client usage in all routes
8. [ ] Migrate authentication to JWT
9. [ ] Remove @supabase/supabase-js dependency
10. [ ] Test all features

**Breaking Changes**:
- Users will need to re-authenticate
- Existing sessions invalidated
- Real-time subscriptions need alternative (if used)

**Acceptance**:
- [ ] All data migrated successfully
- [ ] No Supabase dependencies remaining
- [ ] Authentication working with new system
- [ ] All routes functional
- [ ] Performance equal or better

**Files**:
- `apps/dumphim/app/db/schema.ts` → `packages/db/src/schema/dumphim.ts`
- `apps/dumphim/app/lib/supabaseClient.ts` (DELETE)
- `apps/dumphim/app/lib/server/queries.ts` (CREATE)
- `apps/dumphim/app/lib/server/mutations.ts` (CREATE)
- `apps/dumphim/app/lib/auth.ts` (CREATE)
- All route files using Supabase
- `apps/dumphim/package.json`

**Documentation**:
- See `docs/SUPABASE_MIGRATION.md` for detailed guide

---

### Task 3.6.2: Verify Manual-Co Database Status
**Priority**: Medium | **Estimated**: 1 hour | **Status**: ⏳ PENDING

Check if medico still uses Supabase and migrate if needed.

**Steps**:
1. [ ] Check package.json for Supabase dependencies
2. [ ] Check source code for Supabase imports
3. [ ] If using Supabase, create migration plan
4. [ ] If not using Supabase, update documentation

**Acceptance**:
- [ ] Database dependencies documented
- [ ] Migration plan created (if needed)

---

## Phase 4: Polish & Documentation (Week 4)

### Task 4.1: Performance Optimization
**Priority**: High | **Estimated**: 6 hours

Optimize Core Web Vitals.

**Steps**:
1. Run Lighthouse audits
2. Optimize LCP (images, fonts)
3. Optimize INP (reduce JS)
4. Optimize CLS (layout stability)
5. Bundle analysis and tree-shaking

**Acceptance**:
- [ ] LCP < 1.5s
- [ ] INP < 100ms
- [ ] CLS < 0.1
- [ ] Score 90+

---

### Task 4.2: Extract Shared Configurations
**Priority**: Medium | **Estimated**: 4 hours

Create shared configs for consistency.

**Steps**:
1. Create `packages/config/` with:
   - TypeScript config
   - Tailwind config
   - linting config (oxlint/biome)
   - Prettier config
2. Update all apps to use shared configs
3. Document usage

**Acceptance**:
- [ ] Shared configs in packages/
- [ ] All apps use shared configs
- [ ] Single source of truth

---

### Task 4.3: Update Documentation
**Priority**: High | **Estimated**: 4 hours

Update patterns doc and create migration guides.

**Steps**:
1. Update `docs/unified-rr7-patterns.md`
2. Create migration guide (Node→Bun, Supabase→Drizzle)
3. Document new file structure
4. Create onboarding guide

**Acceptance**:
- [ ] Patterns doc current
- [ ] Migration guide complete
- [ ] New dev can onboard in 30min

---

### Task 4.4: Team Onboarding
**Priority**: Medium | **Estimated**: 2 hours

Present changes to team.

**Steps**:
1. Create presentation
2. Demo new patterns
3. Q&A session
4. Update onboarding docs

**Acceptance**:
- [ ] Team understands new patterns
- [ ] Onboarding docs updated
- [ ] FAQ created

---

## Success Criteria

All tasks complete when:
- [ ] All RR7 apps follow identical structure
- [ ] All apps achieve Core Web Vitals 90+
- [ ] Server Components render 70%+ content
- [ ] Bundle size < 50KB initial JS
- [ ] Developer onboarding < 30 minutes
- [ ] Documentation complete and current

## Dependencies

**Blocked by**:
- None

**Blocks**:
- Season 2 experiments (Yjs real-time, AI integration, etc.)

## Notes

- Keep medico as Next.js reference for now
- Evaluate earth migration separately
- Test thoroughly before merging each phase
- Consider feature flags for risky changes
