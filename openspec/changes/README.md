# Labs Documentation Index

Complete guide to all documentation in the unified RR7 patterns implementation.

## Quick Start

New to the project? Start here:
1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [Code Examples](#code-examples)

---

## Getting Started

### For Developers

1. **[README.md](../apps/playground/README.md)** - App setup and quick start
2. **[migration-guide.md](./migration-guide.md)** - Migrate existing apps to new patterns
3. **[performance-guide.md](./performance-guide.md)** - Performance optimization

### Quick Commands

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build for production
pnpm build

# Type check
pnpm typecheck
```

---

## Architecture Overview

### Core Concepts

1. **[unified-rr7-patterns.md](./unified-rr7-patterns.md)** - Complete architecture guide
   - Technology stack
   - Islands Architecture
   - Streaming patterns
   - State management
   - Edge deployment

2. **[streaming-implementation.md](./streaming-implementation.md)** - Streaming deep dive
   - Route implementation
   - Server queries
   - Skeleton loaders
   - Performance metrics

### Patterns & Examples

3. **[architecture-demo](../apps/playground/app/routes/architecture-demo.tsx)** - Live demo
   - Server Component example
   - Island example
   - Side-by-side comparison

---

## Code Examples

### Islands Architecture

**Server Component** (Zero JavaScript):
```tsx
// components/server/StaticCard.tsx
export function StaticCard({ title, description }) {
  return <article>{title}</article>;
}
```

**Island** (Hydrated):
```tsx
// components/islands/InteractiveCard.tsx
'use client';
export function InteractiveCard({ title }) {
  const [likes, setLikes] = useState(0);
  return <button onClick={() => setLikes(l + 1)}>{likes}</button>;
}
```

### Streaming Data

```tsx
// routes/page.tsx
export async function loader() {
  return { data: getData() }; // Returns Promise
}

<Suspense fallback={<Skeleton />}>
  <Await resolve={data}>
    {(data) => <Component data={data} />}
  </Await>
</Suspense>
```

### Custom Hooks

```tsx
import { useOnlineStatus, useWindowSize } from "~/hooks";

function MyComponent() {
  const isOnline = useOnlineStatus();
  const { width } = useWindowSize();
  // ...
}
```

---

## Package Reference

### @pontistudios/utils

**Location**: `packages/utils/`

**Functions**:
- `cn(...inputs)` - Tailwind class merging
- `formatDate(date, options)` - Date formatting
- `formatCurrency(amount, currency)` - Currency formatting
- `truncate(text, length)` - String truncation
- `generateId()` - Random ID generation
- `deepMerge(target, source)` - Object merging
- `debounce(fn, delay)` - Debounce function
- `throttle(fn, limit)` - Throttle function

**Usage**:
```tsx
import { cn, formatDate } from "@pontistudios/utils";
// or
import { cn, formatDate } from "~/lib/utils";
```

### @pontistudios/tsconfig

**Location**: `packages/tsconfig/`

**Configs**:
- `base.json` - Core TypeScript settings
- `react.json` - React app settings

**Usage**:
```json
{
  "extends": "@pontistudios/tsconfig/react.json",
  "compilerOptions": {
    // App-specific overrides
  }
}
```

### @pontistudios/tailwind-config

**Location**: `packages/tailwind-config/`

**Files**:
- `theme.css` - Tailwind v4 theme

**Usage**:
```css
@import "@pontistudios/tailwind-config/theme.css";

@theme {
  /* App-specific overrides */
}
```

---

## Implementation Status

### Reports

- **[IMPLEMENTATION_STATUS.md](../openspec/changes/implement-unified-rr7-patterns/IMPLEMENTATION_STATUS.md)** - Detailed status
- **[COMPLETION_REPORT.md](../openspec/changes/implement-unified-rr7-patterns/COMPLETION_REPORT.md)** - Completion summary
- **[FINAL_SUMMARY.md](../openspec/changes/implement-unified-rr7-patterns/FINAL_SUMMARY.md)** - Final report
- **[EXECUTIVE_SUMMARY.md](../openspec/changes/implement-unified-rr7-patterns/EXECUTIVE_SUMMARY.md)** - Executive overview

### Metrics

- **4 Shared Packages** ✅
- **3 Streaming Routes** ✅
- **2 Demo Components** ✅
- **5 Custom Hooks** ✅
- **6 Documentation Guides** ✅

---

## Troubleshooting

### Common Issues

**Issue**: Cannot find module '@pontistudios/utils'

**Solution**:
```bash
pnpm --filter @pontistudios/utils build
```

**Issue**: TypeScript errors after migration

**Solution**: Restart TypeScript server in IDE
- VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

**Issue**: Streaming not working

**Solution**: Check that loader returns a Promise (not awaited)

```tsx
// Correct
return { data: getData() };

// Incorrect
return { data: await getData() };
```

---

## FAQ

**Q: What's the difference between Server Components and Islands?**

A: Server Components render on the server and ship zero JavaScript. Islands hydrate on the client and are marked with 'use client'. Use Server Components for static content, Islands for interactivity.

**Q: When should I use streaming?**

A: Use streaming when you have slow data sources or multiple independent data fetches. It improves perceived performance by showing content progressively.

**Q: How do I add a new shared utility?**

A: Add it to `packages/utils/src/`, export from `index.ts`, then run `pnpm --filter @pontistudios/utils build`.

**Q: Can I use React Query with streaming?**

A: Yes! Use streaming for initial data (via loader), React Query for real-time updates and mutations.

---

## Contributing

### Adding New Patterns

1. Document the pattern in `docs/`
2. Create example in `apps/playground/`
3. Update this index
4. Add to migration guide

### Code Style

- Follow existing patterns
- Use TypeScript strictly
- Add JSDoc comments
- Include error handling

---

## Resources

### External Links

- [React Router Docs](https://reactrouter.com/)
- [React 19 Changes](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Speculation Rules](https://developer.chrome.com/)

### Internal Examples

- `/architecture-demo` - Islands Architecture
- `/projects` - Streaming example
- `/tasks` - Parallel streaming

---

## Support

- **Questions**: Check FAQ above
- **Issues**: Review troubleshooting
- **Examples**: See architecture-demo route
- **Documentation**: Browse docs/ directory

---

**Last Updated**: March 9, 2026  
**Status**: Production Ready ✅
