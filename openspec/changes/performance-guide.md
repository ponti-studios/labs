# Performance Optimization Guide

## Critical CSS

**File**: `app/styles/critical.css`

Critical CSS contains only the styles needed for above-the-fold content. Inlining these styles in the `<head>` improves First Contentful Paint (FCP) by 200-300ms.

### What's Included

```css
/* Critical CSS contains: */
- CSS Reset (box-sizing, margins)
- Base typography (font-family, line-height)
- Navigation styles (fixed header)
- Layout (main content padding)
- Loading states (skeleton animation)
- Utility classes (container, sr-only)
- Error states (background, text colors)
```

### How to Inline

**Option 1: Build-time inlining (Recommended)**
Configure your build tool (Vite) to inline critical CSS:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { criticalCss } from 'vite-plugin-critical-css';

export default defineConfig({
  plugins: [
    criticalCss({
      inline: true,
      critical: {
        dimensions: [
          { width: 375, height: 667 },   // Mobile
          { width: 1920, height: 1080 }, // Desktop
        ],
      },
    }),
  ],
});
```

**Option 2: Manual inlining**
Copy the contents of `critical.css` into root.tsx:

```tsx
// app/root.tsx
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Inline critical CSS */}
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
        
        {/* Preload main stylesheet */}
        <link rel="preload" href="/app.css" as="style" />
        <link rel="stylesheet" href="/app.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Benefits

**Before inlining**:
- HTML downloads
- CSS file requested
- CSS downloaded & parsed
- Page renders

**After inlining**:
- HTML downloads (with CSS inline)
- Page renders immediately
- Non-critical CSS loads async

**Time savings**: 200-300ms faster FCP

---

## Resource Hints

### Preconnect

Preconnect to required origins:

```tsx
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://api.example.com" },
];
```

**Benefit**: Establishes early connection, saves 100-200ms

### DNS Prefetch

For origins that will be used later:

```tsx
{ rel: "dns-prefetch", href: "https://analytics.example.com" }
```

### Prefetch

Prefetch likely navigation targets:

```tsx
// Via Speculation Rules (already implemented)
<PrefetchProvider />

// Via link tag
{ rel: "prefetch", href: "/next-page" }
```

---

## Image Optimization

### Lazy Loading

```tsx
<img 
  src="image.jpg" 
  loading="lazy" 
  decoding="async"
  alt="Description"
/>
```

### Responsive Images

```tsx
<img 
  srcSet="small.jpg 300w, medium.jpg 600w, large.jpg 900w"
  sizes="(max-width: 600px) 300px, (max-width: 900px) 600px, 900px"
  src="fallback.jpg"
  alt="Description"
/>
```

### CDN Images

Use Cloudflare Images or similar:

```tsx
const optimizedSrc = `https://images.example.com/cdn-cgi/image/
  width=${width},
  height=${height},
  fit=cover,
  format=auto,
  quality=85
  /${src}`;
```

---

## Font Optimization

### Font Display

```css
@font-face {
  font-family: 'Inter';
  src: url('inter.woff2') format('woff2');
  font-display: swap; /* Prevents FOIT */
}
```

### Subsetting

Load only needed characters:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
```

### Preload Critical Fonts

```tsx
{ rel: "preload", href: "/fonts/inter.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" }
```

---

## Bundle Optimization

### Code Splitting

React Router handles automatic code splitting:

```tsx
// Each route is automatically split
export default function RouteComponent() {
  // This component is in its own chunk
}
```

### Tree Shaking

Ensure proper exports:

```typescript
// Good - Named exports
export { cn, formatDate } from "@pontistudios/utils";

// Bad - Star export (may include unused code)
export * from "@pontistudios/utils";
```

### Dynamic Imports

For heavy components:

```tsx
const HeavyChart = lazy(() => import("~/components/HeavyChart"));

<Suspense fallback={<Skeleton />}>
  <HeavyChart data={data} />
</Suspense>
```

---

## Monitoring

### Web Vitals

Track Core Web Vitals:

```typescript
// app/lib/performance.ts
export function reportWebVitals(metric: Metric) {
  // Send to analytics
  console.log(metric);
}

// In root.tsx
useEffect(() => {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(reportWebVitals);
    getFID(reportWebVitals);
    getFCP(reportWebVitals);
    getLCP(reportWebVitals);
    getTTFB(reportWebVitals);
  });
}, []);
```

### Targets

| Metric | Target | Excellent |
|--------|--------|-----------|
| TTFB | < 100ms | < 50ms |
| FCP | < 1.0s | < 0.5s |
| LCP | < 2.5s | < 1.5s |
| CLS | < 0.1 | 0 |
| INP | < 200ms | < 100ms |

---

## Performance Checklist

### Before Launch

- [ ] Critical CSS inlined
- [ ] Fonts preloaded
- [ ] Images optimized
- [ ] Preconnect hints added
- [ ] Bundle size < 50KB (initial)
- [ ] No render-blocking resources
- [ ] Web Vitals monitored

### Development

- [ ] Lighthouse score 90+
- [ ] No unused JavaScript
- [ ] No layout shifts
- [ ] Fast HMR (< 100ms)

---

## Tools

- **Lighthouse**: Chrome DevTools
- **WebPageTest**: webpagetest.org
- **Bundle Analyzer**: `pnpm analyze`
- **DevTools Performance**: Chrome/Firefox

---

## Results

**Expected improvements**:
- FCP: 200-300ms faster
- LCP: 100-200ms faster
- Bundle: 20-30% smaller
- Lighthouse: 90+ score
