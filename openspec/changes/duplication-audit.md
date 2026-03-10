# Duplication Audit & Consolidation Plan

## Current State Analysis

### 1. Utility Function Duplication

**Issue**: `cn()` function exists in 5 locations
- `apps/playground/app/lib/utils.ts`
- `apps/playground/app/lib/void-styles.ts`
- `apps/dumphim/app/lib/utils.ts`
- `apps/manual-co/src/lib/utils.ts`
- `apps/earth/src/lib/utils.ts`

**Solution**: Move to `@pontistudios/utils` package

### 2. UI Component Duplication

**Issue**: UI primitives duplicated across apps
- `apps/earth/src/components/ui/` has 40+ shadcn components
- `apps/playground` uses `@pontistudios/ui` workspace
- `apps/dumphim` uses `@pontistudios/ui` workspace
- `apps/manual-co` uses `@pontistudios/ui` workspace

**Solution**: Centralize in `@pontistudios/ui` (already started!)

### 3. Package Dependencies Duplication

**Issue**: Same dependencies repeated:

| Dependency | playground | dumphim | manual-co | earth |
|------------|-----------|---------|-----------|-------|
| react | 19.1.0 | 19.1.0 | 18.2.0 | 19.0.0 |
| react-router | 7.5.3 | 7.5.3 | N/A | N/A |
| tailwindcss | 4.1.10 | 4.1.4 | 4.0.15 | 4.1.11 |
| framer-motion | 12.18.1 | 12.9.4 | N/A | 12.6.2 |
| @tanstack/react-query | 5.80.7 | N/A | 5.0.0 | 5.83.1 |
| drizzle-orm | 0.44.4 | 0.43.1 | N/A | N/A |
| lucide-react | 0.539.0 | N/A | N/A | 0.484.0 |
| zod | 3.25.62 | N/A | 3.24.2 | 3.25.76 |

**Solution**: Create `@pontistudios/config` package with shared deps

### 4. Script Duplication

**Issue**: Identical scripts in package.json:
```json
"build": "react-router build"
"dev": "react-router dev"
"lint": "oxlint app --fix"
"format": "oxfmt app --write"
"typecheck": "react-router typegen && tsc"
```

**Solution**: Shared npm scripts via `@pontistudios/config`

### 5. TypeScript Config Duplication

**Issue**: 5 tsconfig.json files with similar configurations

**Solution**: Extend from `@pontistudios/tsconfig` base configs

### 6. Tailwind Config Duplication

**Issue**: Tailwind configs likely similar across apps

**Solution**: Shared `@pontistudios/tailwind-config`

### 7. Database Schema Duplication

**Issue**: Multiple apps define similar tables
- `apps/playground/app/db/schema.ts`
- `apps/dumphim/app/db/schema.ts`
- `apps/earth` uses `@pontistudios/db` workspace

**Solution**: Migrate all to `@pontistudios/db` workspace

### 8. React Query Patterns Duplication

**Issue**: Similar query/mutation patterns across apps

**Current**: Each app defines its own hooks
**Solution**: Shared query factory patterns in `@pontistudios/data`

## Consolidation Plan

### Phase 1: Core Utilities (Immediate)

Create `packages/utils/`:
```typescript
// packages/utils/src/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// packages/utils/src/index.ts
export * from "./cn";
export * from "./invariant";
export * from "./performance";
export * from "./validation";
```

### Phase 2: Shared Config (Week 1)

Create `packages/config/`:
```
packages/config/
├── tsconfig/
│   ├── base.json
│   ├── react.json
│   └── next.json
├── tailwind/
│   ├── base.ts
│   └── shadcn.ts
├── eslint/
│   └── index.js
└── package.json (shared peer deps)
```

### Phase 3: Data Layer (Week 2)

Extend `packages/db/`:
```typescript
// packages/db/src/schema/
├── core/
│   ├── users.ts
│   ├── projects.ts
│   └── common.ts
├── playground/
│   └── experiments.ts
└── dumphim/
    └── trackers.ts
```

### Phase 4: Query Patterns (Week 3)

Create `packages/data/`:
```typescript
// packages/data/src/queries/
├── factories/
│   ├── createQuery.ts
│   ├── createMutation.ts
│   └── createInfiniteQuery.ts
├── hooks/
│   ├── useProjects.ts
│   ├── useTasks.ts
│   └── useOptimisticMutation.ts
└── providers/
    └── QueryProvider.tsx
```

## Implementation Strategy

### Step 1: Extract Utilities (Do First)

1. Create `packages/utils` with `cn()`, `invariant()`, `formatDate()`
2. Update all imports:
   ```typescript
   // Before
   import { cn } from "~/lib/utils";
   
   // After
   import { cn } from "@pontistudios/utils";
   ```
3. Remove duplicated `lib/utils.ts` files

### Step 2: Shared TypeScript Configs

1. Create `packages/tsconfig/base.json`
2. Update all apps to extend:
   ```json
   {
     "extends": "@pontistudios/tsconfig/react.json"
   }
   ```
3. Delete local tsconfig content, keep only specific overrides

### Step 3: Shared Tailwind

1. Create `packages/tailwind-config`
2. Each app's tailwind.config.ts:
   ```typescript
   import baseConfig from "@pontistudios/tailwind-config";
   
   export default {
     ...baseConfig,
     content: ["./app/**/*.{js,jsx,ts,tsx}"]
   };
   ```

### Step 4: Consolidate DB

1. Move all schemas to `packages/db/src/schema/`
2. Each app imports its tables:
   ```typescript
   import { projects, tasks } from "@pontistudios/db/schema/playground";
   ```
3. Delete local `app/db/schema.ts` files

### Step 5: Shared React Query

1. Create generic query hooks in `packages/data`
2. Each app uses:
   ```typescript
   import { useProjects } from "@pontistudios/data/queries";
   
   function MyComponent() {
     const { data } = useProjects();
   }
   ```

## Benefits

1. **Single Source of Truth**: Update in one place
2. **Consistency**: Same patterns everywhere
3. **Bundle Size**: Shared code deduplicated
4. **Maintenance**: Fewer files to update
5. **Onboarding**: New devs learn one pattern

## Migration Priority

1. **High Priority** (Do Now):
   - Utilities (`cn()`, `invariant()`)
   - TypeScript configs
   - Tailwind configs

2. **Medium Priority** (Week 2-3):
   - Database schemas
   - React Query patterns
   - Shared types

3. **Low Priority** (Future):
   - Component patterns
   - Test utilities
   - Storybook configs

## Files to Delete After Consolidation

```
apps/playground/app/lib/utils.ts
apps/dumphim/app/lib/utils.ts
apps/manual-co/src/lib/utils.ts
apps/earth/src/lib/utils.ts
apps/playground/app/db/schema.ts (migrate to package)
apps/dumphim/app/db/schema.ts (migrate to package)
apps/playground/tsconfig.json (extend instead)
apps/dumphim/tsconfig.json (extend instead)
```

## New Package Structure

```
packages/
├── utils/              # cn(), invariant(), formatting
├── config/             # tsconfig, tailwind, eslint
├── db/                 # Drizzle schemas + connection
├── ui/                 # Shared UI components (existing)
└── data/               # React Query patterns
```
