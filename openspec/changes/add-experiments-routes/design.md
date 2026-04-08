## Context

The experiments migrated to `app/experiments/` include React components that can be rendered as routes. The playground app uses React Router v7 with route configuration in `routes.ts` using the `route()` helper. Components in `app/experiments/data/` and `app/experiments/web/` need to be exposed as interactive routes.

Current experiments that are React components:
- `data-agency.tsx` - Glassmorphic landing page demo
- `llm-receipt.tsx` - LLM pricing calculator/receipt viewer  
- `threegl-image-gallery.ts` - Three.js based 3D image gallery

Non-routeable experiments (require different handling):
- `dumphim.tsx` - Uses `@github/spark/components` which are not installed
- `*.ts` utility files - Not React components, just utility scripts
- `*.js` files - Pure JavaScript, not React

## Goals / Non-Goals

**Goals:**
- Add route registrations for React component experiments in `routes.ts`
- Create an experiments index page at `/experiments` listing available experiments
- Make experiments accessible via URL

**Non-Goals:**
- Fix type errors in the experiments (they are experimental code, types can be addressed later)
- Install missing dependencies for `dumphim.tsx`
- Convert utility scripts to routes

## Decisions

1. **Route Path Convention**: Use `/experiments/` prefix
   - `/experiments/data-agency` for data-agency.tsx
   - `/experiments/llm-receipt` for llm-receipt.tsx
   - `/experiments/threegl-image-gallery` for threegl-image-gallery.ts

2. **Route File Placement**: Keep experiments in `app/experiments/` rather than copying to `app/routes/`
   - This maintains git history from original location
   - Avoids duplicating code
   - Update `routes.ts` to reference the files with updated paths

3. **Index Page**: Create `app/routes/experiments.tsx` as a simple listing page
   - Links to each experiment route
   - Brief description of each experiment

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Experiments reference unknown dependencies | Mark as "requires review" - some may not work |
| TypeScript errors in experiments | Experiments are exploratory; type errors acceptable for initial rollout |
| Missing `@github/spark` packages for dumphim | Exclude dumphim from routes, note as blocked on dependencies |

## Open Questions

- Should we install `@github/spark` packages to enable dumphim route?
- Do we want to keep the HTML experiments in `public/experiments/` or convert them?
