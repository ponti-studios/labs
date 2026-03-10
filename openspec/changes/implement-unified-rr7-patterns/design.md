# Design: Unified RR7 Patterns Implementation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REQUEST LIFECYCLE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. EDGE (Cloudflare Worker)                                                │
│     ├─ Receive request at nearest PoP                                       │
│     ├─ Authenticate JWT (verify at edge)                                    │
│     ├─ Check cache (KV / Durable Object)                                    │
│     └─ Route to origin or serve cached                                      │
│                                                                             │
│  2. ORIGIN (Bun + RR7)                                                      │
│     ├─ Streaming SSR starts immediately                                     │
│     ├─ Parallel data fetching (Promise.all)                                 │
│     ├─ Critical path renders (blocking)                                     │
│     └─ Deferred data streams via Suspense                                   │
│                                                                             │
│  3. CLIENT                                                                  │
│     ├─ Islands hydrate selectively                                          │
│     ├─ Signals update without re-renders                                    │
│     ├─ Real-time sync (Electric SQL / WebSocket)                            │
│     └─ Prefetch next routes (Speculation Rules)                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Decisions

### Why Bun?
- **50x faster** than Node for cold starts
- **Native TypeScript** support (no transpile step)
- **Built-in bundler** (no webpack/vite config needed)
- **Compatible** with existing npm packages

### Why React Router 7?
- **Streaming SSR** built-in (not bolted-on)
- **Defer API** for non-blocking data
- **Server Actions** (React 19 integration)
- **Type-safe** route definitions

### Why Signals?
- **Fine-grained reactivity** (only changed values update)
- **No VDOM diffing** for simple state changes
- **Shared state** without Context overhead
- **Performance**: 10x faster than useState for frequent updates

### Why Islands Architecture?
- **Zero JS** for static content (server components)
- **Selective hydration** (only interactive parts get JS)
- **Progressive enhancement** (works without JS)
- **Smaller bundles** (50-70% reduction typical)

## Directory Structure

```
app/
├── routes/                        # File-system routing
│   ├── _index.tsx                # Homepage (zero-JS critical path)
│   ├── _layout.tsx               # Root layout with streaming shell
│   ├── resource/
│   │   ├── route.tsx             # GET handler (loader + action)
│   │   ├── _index.tsx            # List view
│   │   ├── $id.tsx               # Detail (streaming)
│   │   └── $id/
│   │       └── edit.tsx          # Edit form (server action)
│   └── api/
│       ├── health.ts             # Health check (edge)
│       └── webhooks/
│
├── components/
│   ├── ui/                        # Generic UI (Radix + Tailwind)
│   ├── islands/                   # Hydrated components (interactive)
│   │   ├── search-box.tsx
│   │   ├── filter-bar.tsx
│   │   └── real-time-chart.tsx
│   └── server/                    # Server Components (zero-JS)
│       ├── product-detail.tsx
│       └── data-table.tsx
│
├── lib/
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema
│   │   ├── index.ts              # Database connection
│   │   └── edge.ts               # Edge-compatible driver
│   ├── server/
│   │   ├── actions.ts            # Server Actions
│   │   ├── loaders.ts            # Route loaders
│   │   └── cache.ts              # Edge caching
│   └── client/
│       ├── signals/              # Legend State signals
│       │   ├── app.ts
│       │   └── search.ts
│       └── queries.ts            # React Query hooks
│
├── hooks/                         # Custom React hooks
│   ├── use-optimistic.ts
│   └── use-intersection.ts
│
├── styles/
│   ├── app.css                   # Tailwind v4
│   └── critical.css              # Above-fold styles (inlined)
│
└── root.tsx                      # Root layout
```

## Data Flow Patterns

### Pattern 1: Server-First Render

```typescript
// routes/projects/index.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const filters = Object.fromEntries(url.searchParams);
  
  // Parallel fetch (not sequential)
  const [projects, categories, stats] = await Promise.all([
    getProjects(filters),
    getCategories(),
    getProjectStats(),
  ]);
  
  return json({ projects, categories, stats });
}

// Component receives data immediately (no loading state)
export default function ProjectsPage() {
  const { projects, categories, stats } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <Filters categories={categories} />
      <Stats stats={stats} />
      <ProjectList projects={projects} />
    </div>
  );
}
```

### Pattern 2: Streaming with Defer

```typescript
// routes/projects/$id.tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  
  // Critical: Block until ready
  const project = await getProject(id);
  
  // Non-critical: Stream when ready
  const analytics = getProjectAnalytics(id);     // Slow (500ms)
  const related = getRelatedProjects(id);        // Medium (200ms)
  
  return defer({
    project,      // Render immediately
    analytics,    // Stream via Suspense
    related,      // Stream via Suspense
  });
}

export default function ProjectPage() {
  const { project, analytics, related } = useLoaderData<typeof loader>();
  
  return (
    <div>
      {/* Render immediately */}
      <ProjectDetail project={project} />
      
      {/* Stream when ready */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <Await resolve={analytics}>
          {(data) => <ProjectAnalytics data={data} />}
        </Await>
      </Suspense>
      
      <Suspense fallback={<RelatedSkeleton />}>
        <Await resolve={related}>
          {(data) => <RelatedProjects projects={data} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

### Pattern 3: Server Actions

```typescript
// lib/server/actions.ts
'use server';

export async function createProject(formData: FormData) {
  const data = Object.fromEntries(formData);
  
  // Validate
  const result = projectSchema.safeParse(data);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }
  
  // Mutate
  const project = await db
    .insert(projects)
    .values(result.data)
    .returning();
  
  // Invalidate cache
  revalidatePath("/projects");
  
  // Redirect
  redirect(`/projects/${project.id}`);
}

// Component usage
export function ProjectForm() {
  const { pending } = useFormStatus();
  
  return (
    <form action={createProject}>
      <input name="name" required />
      <button type="submit" disabled={pending}>
        {pending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Pattern 4: Optimistic Updates

```typescript
// components/islands/project-list.tsx
'use client';

import { useOptimistic } from "react";

export function ProjectList({ initialProjects }: { initialProjects: Project[] }) {
  const [optimisticProjects, addOptimisticProject] = useOptimistic(
    initialProjects,
    (state, newProject: Project) => [...state, newProject]
  );
  
  async function handleCreate(formData: FormData) {
    const project = {
      id: crypto.randomUUID(),
      name: formData.get('name'),
      isOptimistic: true,
    };
    
    // Update UI immediately
    addOptimisticProject(project);
    
    // Submit to server
    await createProject(formData);
  }
  
  return (
    <>
      <form action={handleCreate}>
        <input name="name" />
        <button type="submit">Add</button>
      </form>
      
      <ul>
        {optimisticProjects.map(project => (
          <li key={project.id} className={project.isOptimistic ? 'opacity-50' : ''}>
            {project.name}
          </li>
        ))}
      </ul>
    </>
  );
}
```

## State Management

### Signals for Client State

```typescript
// lib/client/signals/app.ts
import { signal, computed } from "@preact/signals-react";

// Global state (no context needed)
export const searchQuery = signal("");
export const selectedFilters = signal<string[]>([]);

// Computed (auto-updates)
export const filteredProjects = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return allProjects.value.filter(p => 
    p.name.toLowerCase().includes(query)
  );
});

// Usage (fine-grained reactivity)
export function SearchBox() {
  // No re-render on every keystroke!
  return (
    <input
      value={searchQuery.value}
      onChange={(e) => searchQuery.value = e.target.value}
    />
  );
}
```

## Performance Optimizations

### 1. Speculation Rules (Native Prefetching)

```typescript
// components/prefetch-provider.tsx
export function PrefetchProvider() {
  return (
    <script
      type="speculationrules"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          prerender: [
            {
              source: "list",
              urls: ["/projects", "/dashboard"]
            }
          ],
          prefetch: [
            {
              source: "document",
              where: {
                href_matches: "/*",
                selector_matches: "a[rel=prefetch]"
              }
            }
          ]
        })
      }}
    />
  );
}
```

### 2. Critical CSS Inlining

```css
/* styles/critical.css - Above-fold only */
:root { --bg: #fff; --text: #000; }
body { margin: 0; font-family: system-ui; }
.layout { display: grid; grid-template-columns: 250px 1fr; }
```

```typescript
// Inline in <head>
<style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
<link rel="preload" href="/app.css" as="style" />
```

### 3. Image Optimization

```typescript
// components/optimized-image.tsx
export function OptimizedImage({ src, width, height, priority }) {
  const optimized = `https://images.example.com/cdn-cgi/image/
    width=${width},
    height=${height},
    fit=cover,
    format=auto
    /${src}`;
  
  return (
    <img
      src={optimized}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
    />
  );
}
```

## Migration Strategy

### apps/playground (Reference Implementation)

1. **Upgrade Phase**
   - Switch to Bun runtime
   - Enable Turbopack
   - Upgrade to RR7 with streaming
   - Upgrade to React 19

2. **Refactor Phase**
   - Restructure to new directory layout
   - Convert API routes to server loaders
   - Implement streaming with defer
   - Add Server Components for static content

3. **Optimize Phase**
   - Add Speculation Rules
   - Inline critical CSS
   - Optimize images
   - Measure Core Web Vitals

### apps/dumphim (Supabase → Drizzle)

1. **Database Layer**
   - Migrate from Supabase client to Drizzle ORM
   - Move queries to server loaders
   - Implement proper caching

2. **Auth Migration**
   - Replace Supabase Auth with edge-compatible auth
   - JWT verification at edge
   - Session management

3. **Real-time Updates**
   - Electric SQL for sync (instead of Supabase realtime)
   - Durable Objects for WebSocket state

## Testing Strategy

### Unit Tests (Vitest)
- Server actions
- Database queries
- Utility functions

### E2E Tests (Playwright)
- Critical user flows
- Performance benchmarks
- Accessibility checks

### Performance Tests
- Lighthouse CI
- Web Vitals monitoring
- Bundle size tracking

## Monitoring

### Metrics to Track
- Core Web Vitals (LCP, INP, CLS)
- Time to First Byte (TTFB)
- JavaScript bundle size
- Hydration time

### Tools
- Cloudflare Analytics
- Web Vitals RUM
- Lighthouse CI

## Rollback Plan

If issues arise:
1. **Immediate**: Revert to last stable deployment
2. **Short-term**: Disable Turbopack (use Vite)
3. **Long-term**: Revert to Node if Bun issues persist

## Appendix: File Templates

### Route Template

```typescript
// Template for new routes
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@react-router/node";
import { useLoaderData } from "react-router";

export async function loader({ params }: LoaderFunctionArgs) {
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  return json({});
}

export default function RouteComponent() {
  const data = useLoaderData<typeof loader>();
  return <div>{/* Component */}</div>;
}

export function ErrorBoundary() {
  return <div>Error</div>;
}
```

### Component Template

```typescript
// Server Component (zero-JS)
export async function ServerComponent() {
  const data = await getData();
  return <div>{data}</div>;
}

// Island Component (hydrated)
'use client';
export function IslandComponent() {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```
