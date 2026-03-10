# Labs Architecture Patterns v2.0

**Status**: Cutting Edge / Future-Forward  
**Philosophy**: Zero-compromise performance. Push the web platform to its limits.  
**Last Updated**: March 2026

---

## Core Principles

1. **Speed is a Feature** - Every millisecond matters. Optimize for Core Web Vitals.
2. **Edge-First** - Compute at the edge. Minimize latency.
3. **Zero-JS by Default** - Progressive enhancement. Core functionality works without JS.
4. **Streaming Everything** - Never block. Show content immediately.
5. **Type Safety Everywhere** - Runtime validation at boundaries.

---

## The Stack (2026 Edition)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CUTTING-EDGE STACK                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RUNTIME & BUILD                                                            │
│  ├── Runtime:        Bun (50x faster than Node)                            │
│  ├── Bundler:        Turbopack (Rust-based, instant HMR)                   │
│  ├── Package Mgr:    pnpm (disk efficient)                                 │
│  └── Type Checker:   TypeScript 5.4 (performance mode)                     │
│                                                                             │
│  FRAMEWORK                                                                  │
│  ├── Router:         React Router 7 (streaming, defer, parallel loaders)   │
│  ├── Rendering:      SSR + Streaming + Islands Architecture                │
│  ├── Components:     React 19 (Actions, useOptimistic, Server Components)  │
│  └── State:          Signals (Legend State) + React Query (server state)   │
│                                                                             │
│  STYLING & UI                                                               │
│  ├── CSS:            Tailwind CSS 4.x (CSS-first, no JS overhead)          │
│  ├── Primitives:     Radix UI (accessible, unstyled)                       │
│  ├── Animation:      Framer Motion (GPU-accelerated)                       │
│  └── Icons:          Lucide React (tree-shakeable)                         │
│                                                                             │
│  DATA & SYNC                                                                │
│  ├── ORM:            Drizzle (type-safe, SQL-first)                        │
│  ├── Database:       PostgreSQL (Neon or Supabase)                         │
│  ├── Real-time:      Electric SQL (sync to edge)                           │
│  └── Edge Cache:     Cloudflare Workers (Durable Objects)                  │
│                                                                             │
│  PERFORMANCE                                                                │
│  ├── Prefetching:    Speculation Rules API (native browser)                │
│  ├── Images:         Cloudflare Images (format auto, resize)               │
│  ├── Fonts:          Next Font (optimization + preloading)                 │
│  └── Monitoring:     Web Vitals (RUM + lab data)                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure (Performance-Optimized)

```
app/
├── routes/                        # File-system routing with conventions
│   ├── _index.tsx                # Homepage (zero-JS critical path)
│   ├── _layout.tsx               # Root layout with streaming
│   ├── resource/
│   │   ├── route.tsx             # GET handler (loader)
│   │   ├── _index.tsx            # List view
│   │   ├── $id.tsx               # Detail (streaming with Suspense)
│   │   └── $id/
│   │       ├── edit.tsx          # Edit form (server action)
│   │       └── _layout.tsx       # Shared layout
│   └── api/
│       ├── health.ts             # Health check (edge)
│       ├── graphql.ts            # GraphQL API (if needed)
│       └── webhooks/
│           └── stripe.ts         # Webhook handlers
│
├── components/
│   ├── ui/                        # Radix primitives + styling
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── skeleton.tsx
│   ├── islands/                   # Interactive islands (hydrated)
│   │   ├── search-box.tsx
│   │   ├── filter-bar.tsx
│   │   └── real-time-chart.tsx
│   ├── server/                    # Server Components (zero-JS)
│   │   ├── product-detail.tsx
│   │   ├── markdown-renderer.tsx
│   │   └── data-table.tsx
│   └── features/                  # Feature modules
│       └── dashboard/
│           ├── index.tsx
│           ├── stats-card.tsx
│           └── activity-feed.tsx
│
├── lib/
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema
│   │   ├── migrations/           # Versioned migrations
│   │   ├── seed.ts
│   │   └── edge.ts               # Edge-compatible driver
│   ├── server/
│   │   ├── actions.ts            # Server Actions (mutations)
│   │   ├── loaders.ts            # Data loading patterns
│   │   ├── cache.ts              # Edge caching strategies
│   │   └── auth.ts               # Edge-compatible auth
│   ├── client/
│   │   ├── signals/              # Legend State signals
│   │   ├── queries.ts            # React Query hooks
│   │   └── prefetch.ts           # Speculation rules
│   └── edge/                     # Edge runtime utilities
│       ├── kv.ts                 # KV storage (Cloudflare)
│       ├── durable-objects.ts    # Stateful edge
│       └── geolocation.ts        # Geo utilities
│
├── hooks/                         # Custom React hooks
│   ├── use-optimistic.ts         # React 19 useOptimistic
│   ├── use-form-status.ts        # React 19 useFormStatus
│   ├── use-intersection.ts       # Lazy loading trigger
│   └── use-performance.ts        # Web Vitals tracking
│
├── styles/
│   ├── app.css                   # Tailwind v4 (CSS-first)
│   ├── critical.css              # Above-fold styles (inlined)
│   └── animations.css            # GPU-optimized animations
│
├── utils/
│   ├── cn.ts                     # Tailwind class merging
│   ├── invariant.ts              # Runtime assertions
│   ├── performance.ts            # Performance monitoring
│   └── validation.ts             # Zod schemas
│
├── entry.server.tsx              # Server entry (streaming)
├── entry.client.tsx              # Client entry (islands)
├── root.tsx                      # Root layout
├── routes.ts                     # Route configuration
└── sitemap.ts                    # Dynamic sitemap
```

---

## Streaming Architecture

### The Goal: Time to First Byte < 50ms

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STREAMING RENDER LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. EDGE START                                                              │
│     ├── Receive request at nearest edge node (Cloudflare)                  │
│     ├── Authenticate via JWT (verify at edge, < 1ms)                       │
│     └── Start streaming HTML immediately                                    │
│                                                                             │
│  2. CRITICAL RENDER (blocking)                                              │
│     ├── Layout shell (always available)                                     │
│     ├── Page metadata (SEO critical)                                        │
│     └── First contentful paint                                              │
│                                                                             │
│  3. STREAMING CONTENT (non-blocking)                                        │
│     ├── Suspense boundaries stream as ready                                 │
│     ├── Database queries execute in parallel                                │
│     └── Each Suspense chunk streams independently                           │
│                                                                             │
│  4. INTERACTIVE ISLANDS                                                     │
│     ├── Islands hydrate selectively                                         │
│     ├── Priority: visible + interactive elements first                      │
│     └── Deferred: below-fold, non-critical                                  │
│                                                                             │
│  5. BACKGROUND ENHANCEMENT                                                  │
│     ├── Prefetch next routes (Speculation Rules API)                        │
│     ├── Preload critical assets                                             │
│     └── Analytics, non-critical JS                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Route with Streaming

```typescript
// routes/projects/$id.tsx
import { Suspense } from "react";
import { defer, type LoaderFunctionArgs } from "@react-router/node";
import { Await, useLoaderData } from "react-router";
import { ProjectSkeleton } from "~/components/ui/skeleton";
import { ProjectDetail } from "~/components/server/project-detail";
import { ProjectAnalytics } from "~/components/islands/project-analytics";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  
  // Critical: Load immediately
  const project = await getProject(id); // Fast query
  
  // Streaming: Defer slow data
  const analytics = getProjectAnalytics(id); // Slow query
  const relatedProjects = getRelatedProjects(id); // Medium query
  
  return defer({
    project,        // Blocks until ready
    analytics,      // Streams when ready
    relatedProjects // Streams when ready
  });
}

export default function ProjectPage() {
  const { project, analytics, relatedProjects } = useLoaderData<typeof loader>();
  
  return (
    <div className="project-page">
      {/* Critical: Render immediately */}
      <ProjectDetail project={project} />
      
      {/* Stream 1: Analytics */}
      <Suspense fallback={<ProjectSkeleton count={3} />}>
        <Await resolve={analytics}>
          {(data) => <ProjectAnalytics data={data} />}
        </Await>
      </Suspense>
      
      {/* Stream 2: Related */}
      <Suspense fallback={<ProjectSkeleton count={2} />}>
        <Await resolve={relatedProjects}>
          {(data) => <RelatedProjects projects={data} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

### Parallel Data Fetching

```typescript
// lib/server/loaders.ts
import { json } from "@react-router/node";

export async function parallelLoader() {
  // Fire all requests simultaneously
  const [users, posts, stats] = await Promise.all([
    getUsers(),      // 50ms
    getPosts(),      // 80ms
    getStats(),      // 30ms
  ]);
  
  // Total: 80ms (not 160ms)
  return json({ users, posts, stats });
}

export async function streamingLoader() {
  // Fast data blocks
  const config = await getConfig(); // 10ms
  
  // Slow data streams
  const heavyData = getHeavyData(); // 500ms
  
  return defer({
    config,      // Render immediately
    heavyData,   // Stream when ready
  });
}
```

---

## Islands Architecture

### Zero-JS Server Components

```typescript
// components/server/product-detail.tsx
// This component renders on the server. Zero JavaScript shipped.

import { db } from "~/lib/db";
import { formatPrice } from "~/utils/currency";

export async function ProductDetail({ productId }: { productId: string }) {
  // Direct database query on server
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: { images: true, reviews: true }
  });
  
  if (!product) return <NotFound />;
  
  return (
    <article className="product">
      <h1>{product.name}</h1>
      <p className="price">{formatPrice(product.price)}</p>
      <div className="description">
        {/* Markdown rendered server-side */}
        <MarkdownRenderer content={product.description} />
      </div>
      
      {/* Images: Use native loading="lazy" */}
      {product.images.map((img, i) => (
        <img
          key={img.id}
          src={img.url}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      ))}
      
      {/* Static reviews: No interactivity needed */}
      <ReviewList reviews={product.reviews} />
    </article>
  );
}
```

### Hydrated Islands

```typescript
// components/islands/search-box.tsx
'use client'; // Marks boundary for hydration

import { useState, useTransition } from "react";
import { useSignals } from "@preact/signals-react";
import { searchQuery } from "~/lib/client/signals/search";

export function SearchBox() {
  // Signal: Fine-grained reactivity (no re-render on every keystroke)
  const query = useSignals(searchQuery);
  const [isPending, startTransition] = useTransition();
  
  return (
    <div className="search-box">
      <input
        type="search"
        value={query.value}
        onChange={(e) => {
          // Update signal (no React re-render)
          searchQuery.value = e.target.value;
          
          // Debounced search in transition
          startTransition(() => {
            performSearch(e.target.value);
          });
        }}
        className={isPending ? "pending" : ""}
      />
      {isPending && <Spinner />}
    </div>
  );
}
```

### Hydration Boundaries

```typescript
// routes/projects/index.tsx
import { ProjectList } from "~/components/server/project-list";
import { SearchBox } from "~/components/islands/search-box";
import { FilterBar } from "~/components/islands/filter-bar";
import { RealtimeIndicator } from "~/components/islands/realtime-indicator";

export default function ProjectsPage() {
  return (
    <div className="projects-page">
      {/* Server Component: Zero JS */}
      <header>
        <h1>Projects</h1>
        <p>Manage your projects</p>
      </header>
      
      {/* Island: Hydrated for interactivity */}
      <SearchBox />
      
      {/* Island: Hydrated for interactivity */}
      <FilterBar />
      
      {/* Server Component: Static list */}
      <ProjectList />
      
      {/* Island: Only hydrates when data changes */}
      <RealtimeIndicator />
    </div>
  );
}
```

---

## React 19 Patterns

### Server Actions

```typescript
// app/lib/server/actions.ts
'use server';

import { redirect } from "@react-router/node";
import { db } from "~/lib/db";
import { projectSchema } from "~/utils/validation";
import { revalidatePath } from "~/lib/server/cache";

export async function createProject(formData: FormData) {
  // Runs on server
  const data = Object.fromEntries(formData);
  
  // Validate
  const result = projectSchema.safeParse(data);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }
  
  // Mutate
  const project = await db.insert(projects).values(result.data).returning();
  
  // Revalidate cache
  revalidatePath("/projects");
  
  // Redirect
  redirect(`/projects/${project.id}`);
}

export async function updateProject(id: string, formData: FormData) {
  const data = Object.fromEntries(formData);
  
  await db
    .update(projects)
    .set(data)
    .where(eq(projects.id, id));
  
  revalidatePath(`/projects/${id}`);
  return { success: true };
}
```

### Using Actions in Components

```typescript
// components/islands/project-form.tsx
'use client';

import { useFormStatus } from "react-dom";
import { useOptimistic } from "react";
import { createProject } from "~/lib/server/actions";

export function ProjectForm() {
  const { pending } = useFormStatus();
  
  // Optimistic UI: Show result before server confirms
  const [optimisticState, addOptimistic] = useOptimistic(
    { projects: [] },
    (state, newProject) => ({
      projects: [...state.projects, newProject]
    })
  );
  
  async function handleSubmit(formData: FormData) {
    const project = {
      id: crypto.randomUUID(),
      name: formData.get('name'),
      // ... optimistic data
    };
    
    // Update UI immediately
    addOptimistic(project);
    
    // Submit to server
    await createProject(formData);
  }
  
  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <input name="description" />
      
      <button type="submit" disabled={pending}>
        {pending ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
}
```

### Optimistic Updates

```typescript
// hooks/use-optimistic-project.ts
import { useOptimistic } from "react";

export function useOptimisticProjects(initialProjects: Project[]) {
  const [optimisticProjects, addOptimisticProject] = useOptimistic(
    initialProjects,
    (state, newProject: Project) => [...state, newProject]
  );
  
  return {
    projects: optimisticProjects,
    addProject: addOptimisticProject
  };
}

// Usage in component
export function ProjectList({ initialProjects }: { initialProjects: Project[] }) {
  const { projects, addProject } = useOptimisticProjects(initialProjects);
  
  return (
    <ul>
      {projects.map(project => (
        <li key={project.id}>
          {project.name}
          {project.isOptimistic && <span>(Saving...)</span>}
        </li>
      ))}
    </ul>
  );
}
```

---

## Edge-First Architecture

### Cloudflare Workers Setup

```typescript
// worker.ts (Cloudflare Worker entry)
import { createRequestHandler } from "@react-router/cloudflare";
import * as build from "./build/server";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Edge caching
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);
    const cached = await cache.match(cacheKey);
    
    if (cached) return cached;
    
    // Handle request
    const handler = createRequestHandler(build, "production");
    const response = await handler(request, {
      env,
      ctx,
      cloudflare: { cache, cf: request.cf }
    });
    
    // Cache successful GETs
    if (request.method === "GET" && response.status === 200) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    
    return response;
  }
};
```

### Edge-Compatible Database

```typescript
// lib/db/edge.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Neon serverless driver works at edge
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// For writes, use Durable Objects for consistency
export async function edgeSafeQuery<T>(
  query: Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await query;
  } catch (error) {
    // Log to edge analytics
    console.error("Edge query failed:", error);
    
    if (fallback !== undefined) return fallback;
    throw error;
  }
}
```

### Geolocation & Personalization

```typescript
// lib/edge/geolocation.ts
interface GeoData {
  country: string;
  city: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

export function getGeoData(request: Request): GeoData | null {
  // Cloudflare adds CF-IPCountry header
  const country = request.headers.get("CF-IPCountry");
  
  if (!country) return null;
  
  return {
    country,
    city: request.headers.get("CF-IPCity") || "",
    timezone: request.headers.get("CF-Timezone") || "UTC",
    latitude: parseFloat(request.headers.get("CF-IPLatitude") || "0"),
    longitude: parseFloat(request.headers.get("CF-IPLongitude") || "0"),
  };
}

// Usage in loader
export async function loader({ request }: LoaderFunctionArgs) {
  const geo = getGeoData(request);
  
  // Personalize content based on location
  const localizedContent = geo 
    ? await getContentForRegion(geo.country)
    : await getDefaultContent();
  
  return json({ content: localizedContent, geo });
}
```

### Durable Objects for Stateful Edge

```typescript
// lib/edge/durable-objects.ts
export class RealtimeSync implements DurableObject {
  private sessions: WebSocket[] = [];
  
  async fetch(request: Request) {
    const upgradeHeader = request.headers.get("Upgrade");
    
    if (upgradeHeader === "websocket") {
      const [client, server] = Object.values(new WebSocketPair());
      
      this.sessions.push(server);
      
      server.accept();
      server.addEventListener("message", async (msg) => {
        // Broadcast to all connected clients
        this.sessions.forEach(s => {
          if (s !== server && s.readyState === WebSocket.READY_STATE_OPEN) {
            s.send(msg.data);
          }
        });
      });
      
      return new Response(null, { status: 101, webSocket: client });
    }
    
    return new Response("Expected websocket", { status: 400 });
  }
}
```

---

## Performance Patterns

### Speculation Rules (Native Prefetching)

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
              urls: ["/projects", "/dashboard", "/settings"]
            }
          ],
          prefetch: [
            {
              source: "document",
              where: {
                href_matches: "/*",
                selector_matches: "a[rel=prefetch]"
              },
              eagerness: "moderate"
            }
          ]
        })
      }}
    />
  );
}

// Usage: Add rel="prefetch" to links
function Navigation() {
  return (
    <nav>
      <a href="/projects" rel="prefetch">Projects</a>
      <a href="/dashboard" rel="prefetch">Dashboard</a>
    </nav>
  );
}
```

### Critical CSS Inlining

```css
/* styles/critical.css */
/* Only above-fold styles. Inlined in <head> */
:root {
  --bg: #ffffff;
  --text: #000000;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
}

/* Layout shell */
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

/* Don't include: */
/* - Below-fold component styles */
/* - Animations */
/* - Complex selectors */
```

```typescript
// root.tsx
import criticalCSS from "./styles/critical.css?inline";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        {/* Inline critical CSS */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* Preload non-critical CSS */}
        <link 
          rel="preload" 
          href="/app.css" 
          as="style"
          onLoad="this.rel='stylesheet'"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Image Optimization

```typescript
// components/optimized-image.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false
}: OptimizedImageProps) {
  // Cloudflare Images URL construction
  const optimizedSrc = `https://images.example.com/cdn-cgi/image/
    width=${width},
    height=${height},
    fit=cover,
    format=auto,
    quality=85
    /${src}`;
  
  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      style={{
        aspectRatio: `${width} / ${height}`,
        backgroundColor: "#f0f0f0" // Placeholder
      }}
    />
  );
}
```

### Font Optimization

```typescript
// lib/fonts.ts
import localFont from "next/font/local";

export const inter = localFont({
  src: [
    {
      path: "./fonts/inter-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/inter-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/inter-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap", // Prevent FOIT
  preload: true,
  variable: "--font-inter",
});

// Usage in root.tsx
<html className={inter.variable}>
```

---

## State Management with Signals

### Why Signals?

```
React State (useState):
- Component re-renders on every change
- Updates are batched, but still re-render
- Prop drilling or context for sharing

Signals:
- Fine-grained reactivity
- Only subscribed components update
- No re-render, direct DOM updates
- Shared state without context
```

### Signal Patterns

```typescript
// lib/client/signals/app.ts
import { signal, computed } from "@preact/signals-react";

// Global state (no context needed)
export const searchQuery = signal("");
export const selectedFilters = signal<string[]>([]);
export const viewMode = signal<"grid" | "list">("grid");

// Computed values (auto-update when dependencies change)
export const filteredProjects = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const filters = selectedFilters.value;
  
  return projects.value.filter(project => {
    const matchesQuery = project.name.toLowerCase().includes(query);
    const matchesFilters = filters.length === 0 || 
      filters.every(f => project.tags.includes(f));
    
    return matchesQuery && matchesFilters;
  });
});

// Usage in component (only re-renders when filteredProjects changes)
export function ProjectList() {
  // No useState, no useEffect
  const projects = filteredProjects.value;
  
  return (
    <ul>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </ul>
  );
}
```

### Signal-Based Forms

```typescript
// components/islands/search-form.tsx
import { useSignals } from "@preact/signals-react";
import { searchQuery, selectedFilters } from "~/lib/client/signals/search";

export function SearchForm() {
  // Signals work outside React render cycle
  const query = useSignals(searchQuery);
  const filters = useSignals(selectedFilters);
  
  return (
    <form>
      <input
        value={query.value}
        onChange={(e) => {
          // Updates signal, no re-render
          searchQuery.value = e.target.value;
        }}
      />
      
      <FilterSelect
        selected={filters.value}
        onChange={(newFilters) => {
          selectedFilters.value = newFilters;
        }}
      />
    </form>
  );
}
```

---

## Real-Time Sync

### Electric SQL Integration

```typescript
// lib/sync/electric.ts
import { ShapeStream, Shape } from "@electric-sql/client";

// Subscribe to database changes
export function useLiveQuery<T>(table: string, options?: QueryOptions) {
  const [data, setData] = useState<T[]>([]);
  
  useEffect(() => {
    const stream = new ShapeStream({
      url: `${ELECTRIC_URL}/v1/shape`,
      params: { table, ...options }
    });
    
    const shape = new Shape(stream);
    
    shape.subscribe((newData) => {
      setData(newData as T[]);
    });
    
    return () => stream.unsubscribeAll();
  }, [table]);
  
  return data;
}

// Usage
export function LiveProjectList() {
  const projects = useLiveQuery<Project>("projects", {
    where: "status = 'active'"
  });
  
  return (
    <ul>
      {projects.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### Optimistic + Real-Time

```typescript
// components/islands/realtime-project.tsx
export function RealtimeProject({ projectId }: { projectId: string }) {
  // Initial data from loader
  const { project: initialProject } = useLoaderData<typeof loader>();
  
  // Subscribe to changes
  const liveProject = useLiveQuery<Project>("projects", {
    where: `id = '${projectId}'`
  })[0];
  
  // Merge: loader data + live updates
  const project = liveProject || initialProject;
  
  return <ProjectDetail project={project} />;
}
```

---

## Error Handling & Resilience

### Error Boundaries with Recovery

```typescript
// components/error-boundary.tsx
import { isRouteErrorResponse, useRouteError, useRevalidator } from "react-router";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-page">
        <h1>Error {error.status}</h1>
        <p>{error.statusText}</p>
        
        {error.status >= 500 && (
          <button 
            onClick={() => revalidator.revalidate()}
            disabled={revalidator.state === "loading"}
          >
            Try Again
          </button>
        )}
        
        {error.status === 404 && (
          <a href="/">Go Home</a>
        )}
      </div>
    );
  }
  
  // Unexpected error
  return (
    <div className="error-page">
      <h1>Something Went Wrong</h1>
      <p>We've been notified and are working on it.</p>
      <button onClick={() => window.location.reload()}>
        Refresh Page
      </button>
    </div>
  );
}
```

### Loading States with Skeletons

```typescript
// components/ui/skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "animate-pulse bg-gray-200 rounded",
        className
      )} 
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="project-card">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// Usage in Suspense
<Suspense fallback={<ProjectCardSkeleton count={5} />}>
  <ProjectList />
</Suspense>
```

---

## Migration Checklist

When modernizing an existing app:

### Phase 1: Foundation
- [ ] Switch to Bun runtime
- [ ] Enable Turbopack in dev
- [ ] Upgrade to React 19
- [ ] Upgrade to RR7 with streaming
- [ ] Configure Tailwind v4

### Phase 2: Performance
- [ ] Identify Server Components (static content)
- [ ] Create Islands for interactive parts
- [ ] Implement streaming with defer
- [ ] Add Speculation Rules prefetching
- [ ] Inline critical CSS
- [ ] Optimize images (Cloudflare/Next Images)

### Phase 3: State Management
- [ ] Replace Zustand/Redux with Signals
- [ ] Keep React Query for server state
- [ ] Implement optimistic updates
- [ ] Add real-time sync (Electric SQL)

### Phase 4: Edge
- [ ] Deploy to Cloudflare Workers
- [ ] Move database to Neon (serverless)
- [ ] Implement edge caching
- [ ] Add geolocation features
- [ ] Use Durable Objects for real-time

### Phase 5: Polish
- [ ] Add Web Vitals monitoring
- [ ] Implement proper error boundaries
- [ ] Add loading skeletons
- [ ] Test Core Web Vitals (target: 90+)
- [ ] Accessibility audit

---

## Benchmarks

Target metrics for all labs apps:

| Metric | Target | Excellent |
|--------|--------|-----------|
| **TTFB** | < 100ms | < 50ms |
| **FCP** | < 1.0s | < 0.5s |
| **LCP** | < 2.5s | < 1.5s |
| **CLS** | < 0.1 | 0 |
| **INP** | < 200ms | < 100ms |
| **TBT** | < 200ms | < 50ms |
| **Bundle Size** | < 100KB | < 50KB |
| **Time to Interactive** | < 3.0s | < 1.5s |

---

## Anti-Patterns (What NOT to Do)

### ❌ Don't: Use Client-Side Data Fetching for Initial Load

```typescript
// BAD: Waterfall, slow
export default function Page() {
  const [data, setData] = useState();
  
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  
  if (!data) return <Spinner />;
  return <Content data={data} />;
}
```

### ✅ Do: Use Server Loaders

```typescript
// GOOD: Instant render
export async function loader() {
  return json({ data: await getData() });
}

export default function Page() {
  const { data } = useLoaderData();
  return <Content data={data} />;
}
```

### ❌ Don't: Hydrate Everything

```typescript
// BAD: 200KB of JS for static content
export default function Page() {
  return (
    <article>
      <h1>{title}</h1>
      <p>{content}</p>
    </article>
  );
}
```

### ✅ Do: Use Server Components

```typescript
// GOOD: Zero JS for static content
export async function Page() {
  const content = await getContent();
  
  return (
    <article>
      <h1>{content.title}</h1>
      <p>{content.body}</p>
    </article>
  );
}
```

### ❌ Don't: Sequential Data Fetching

```typescript
// BAD: 150ms + 200ms = 350ms
const user = await getUser();      // 150ms
const posts = await getPosts();    // 200ms
```

### ✅ Do: Parallel Fetching

```typescript
// GOOD: max(150ms, 200ms) = 200ms
const [user, posts] = await Promise.all([
  getUser(),   // 150ms
  getPosts(),  // 200ms
]);
```

---

**References:**
- React Router 7 Streaming: https://reactrouter.com/
- React 19: https://react.dev/
- Bun Performance: https://bun.sh/
- Cloudflare Workers: https://workers.cloudflare.com/
- Electric SQL: https://electric-sql.com/
- Speculation Rules: https://developer.chrome.com/
