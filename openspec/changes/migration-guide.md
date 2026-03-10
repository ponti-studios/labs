# Migration Guide: Unified RR7 Patterns

## Overview

This guide documents the migration from fragmented app architectures to unified React Router 7 patterns with shared packages.

## What Changed

### Before (Fragmented)
```
apps/
├── playground/
│   ├── lib/utils.ts (cn function)
│   ├── tsconfig.json (custom)
│   └── tailwind.config.ts (custom)
├── dumphim/
│   ├── lib/utils.ts (same cn function)
│   ├── tsconfig.json (different)
│   └── tailwind.config.ts (different)
└── manual-co/
    ├── lib/utils.ts (same cn function again!)
    └── ...
```

### After (Unified)
```
packages/
├── utils/              # Shared utilities
├── tsconfig/           # Shared TypeScript configs
├── tailwind-config/    # Shared Tailwind config
└── ui/                 # Shared UI components

apps/
├── playground/
│   ├── lib/utils.ts (re-exports from @pontistudios/utils)
│   └── tsconfig.json (extends @pontistudios/tsconfig)
└── dumphim/
    ├── lib/utils.ts (re-exports from @pontistudios/utils)
    └── tsconfig.json (extends @pontistudios/tsconfig)
```

## Migration Steps

### Step 1: Update Dependencies

Add shared packages to your app's `package.json`:

```json
{
  "dependencies": {
    "@pontistudios/ui": "workspace:*",
    "@pontistudios/utils": "workspace:*",
    "@pontistudios/tailwind-config": "workspace:*"
  },
  "devDependencies": {
    "@pontistudios/tsconfig": "workspace:*"
  }
}
```

Then install:
```bash
pnpm install
```

### Step 2: Update TypeScript Config

Replace your `tsconfig.json` content:

```json
{
  "extends": "@pontistudios/tsconfig/react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

**Before:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    }
  }
}
```

### Step 3: Update Tailwind Config

Replace your `tailwind.config.ts`:

```typescript
import { baseConfig } from "@pontistudios/tailwind-config";
import type { Config } from "tailwindcss";

export default {
  ...baseConfig,
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
} satisfies Config;
```

**Before:**
```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        // ... 30+ color definitions
      },
    },
  },
} satisfies Config;
```

### Step 4: Update Utility File

Replace `app/lib/utils.ts`:

```typescript
// Re-export from shared utilities package
export * from "@pontistudios/utils";
```

**Before:**
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Step 5: Update Imports (Optional)

You can now import directly from shared packages:

```typescript
// Option 1: Keep using local alias (recommended)
import { cn, formatDate } from "~/lib/utils";

// Option 2: Import directly from shared package
import { cn, formatDate } from "@pontistudios/utils";
```

Both work the same way. Option 1 is recommended because:
- Consistent with existing imports
- Can add app-specific utilities alongside shared ones
- Easier to migrate incrementally

## New Directory Structure

When creating new features, follow this structure:

```
app/
├── components/
│   ├── ui/                 # @pontistudios/ui components
│   ├── islands/            # Interactive components (hydrated)
│   ├── server/             # Server Components (zero JS)
│   └── features/           # Feature-specific components
│       └── projects/
│           ├── project-card.tsx
│           └── project-form.tsx
├── lib/
│   ├── server/
│   │   ├── queries.ts      # Server data fetching
│   │   └── mutations.ts    # Server Actions
│   └── client/
│       ├── queries.ts      # React Query hooks
│       └── signals/        # Legend State signals
├── hooks/                  # Custom React hooks
└── routes/                 # RR7 routes
```

## Server vs Client Components

### Server Components (Zero JS)

Use for:
- Static content
- Data fetching from database
- SEO-critical content

Example:
```typescript
// components/server/project-list.tsx
export async function ProjectList() {
  const projects = await getProjects(); // Server-only query
  
  return (
    <ul>
      {projects.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### Islands (Client Components)

Use for:
- Interactive elements
- Forms
- Real-time updates
- Browser APIs

Example:
```typescript
// components/islands/search-box.tsx
'use client';

import { searchQuery } from "~/lib/client/signals";

export function SearchBox() {
  return (
    <input
      value={searchQuery.value}
      onChange={(e) => searchQuery.value = e.target.value}
    />
  );
}
```

## Data Fetching Patterns

### Pattern 1: Server Loader (Default)

```typescript
// routes/projects/index.tsx
import { json } from "@react-router/node";
import { getProjects } from "~/lib/server/queries";

export async function loader() {
  const projects = await getProjects();
  return json({ projects });
}

export default function ProjectsPage() {
  const { projects } = useLoaderData<typeof loader>();
  return <ProjectList projects={projects} />;
}
```

### Pattern 2: Streaming with Defer

```typescript
// routes/projects/$id.tsx
import { defer } from "@react-router/node";

export async function loader({ params }) {
  const project = await getProject(params.id);
  const analytics = getAnalytics(params.id); // Slow
  
  return defer({
    project,      // Blocks
    analytics,    // Streams
  });
}
```

### Pattern 3: Client-Side with React Query

```typescript
// Use for real-time updates or client filtering
import { useProjects } from "~/lib/client/queries";

export function ProjectListClient() {
  const { data, isLoading } = useProjects();
  
  if (isLoading) return <Skeleton />;
  return <List projects={data} />;
}
```

## Shared Packages API

### @pontistudios/utils

```typescript
import { 
  cn,                    // Tailwind class merging
  invariant,             // Runtime assertions
  formatDate,            // Date formatting
  formatCurrency,        // Currency formatting
  truncate,              // String truncation
  generateId,            // Random ID generation
  deepMerge,             // Object merging
  debounce,              // Debounce function
  throttle               // Throttle function
} from "@pontistudios/utils";
```

### @pontistudios/tsconfig

Configs available:
- `base.json` - Core TypeScript config
- `react.json` - React apps (extends base)

### @pontistudios/tailwind-config

```typescript
import { baseConfig } from "@pontistudios/tailwind-config";

export default {
  ...baseConfig,
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
};
```

## Testing the Migration

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Build shared packages**:
   ```bash
   pnpm --filter @pontistudios/utils build
   ```

3. **Run typecheck**:
   ```bash
   pnpm typecheck
   ```

4. **Run dev server**:
   ```bash
   pnpm dev
   ```

5. **Test build**:
   ```bash
   pnpm build
   ```

## Common Issues

### Issue: "Cannot find module '@pontistudios/utils'"

**Solution**: Build the package first:
```bash
pnpm --filter @pontistudios/utils build
```

### Issue: TypeScript errors after migration

**Solution**: Restart TypeScript server in your IDE:
- VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

### Issue: Tailwind styles not working

**Solution**: Ensure content paths are correct in your tailwind.config.ts:
```typescript
content: ["./app/**/*.{js,jsx,ts,tsx}"]
```

## Benefits of Migration

1. **Single Source of Truth**: Update utilities in one place
2. **Consistency**: Same patterns across all apps
3. **Bundle Size**: Shared code = smaller apps
4. **Faster Development**: Don't re-solve same problems
5. **Easier Onboarding**: New devs learn one pattern

## Rollback Plan

If issues arise:

1. Keep local files as backup during migration
2. Revert imports from `@pontistudios/*` to local
3. Remove shared packages from package.json
4. Restore original configuration files

## Questions?

- Check `docs/unified-rr7-patterns.md` for architecture details
- Check `docs/duplication-audit.md` for consolidation rationale
- Ask in team chat for help
