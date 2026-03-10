# Proposal: Implement Unified RR7 Patterns

## Summary

Migrate all labs applications to a unified, cutting-edge React Router 7 architecture that prioritizes performance, type safety, and developer experience. This establishes the gold standard for all future lab experiments and products.

## Problem Statement

Our current labs monorepo has divergent architectures across apps:

- **apps/playground**: RR7 with inconsistent patterns (mix of loaders, client fetching, Supabase)
- **apps/dumphim**: RR7 but relies heavily on client-side Supabase (bypassing server rendering)
- **apps/manual-co**: Next.js 14 (different framework entirely)
- **apps/earth**: Vite + React SPA (no SSR, no routing)

This fragmentation creates:
- **Mental overhead**: Different patterns in every app
- **Duplicated effort**: Re-solving the same problems multiple ways
- **Inconsistent performance**: Some apps fast, others slow
- **Barrier to contribution**: New team members must learn N different stacks

## Proposed Solution

Standardize on a cutting-edge RR7 stack with:

### Core Technologies
- **React Router 7** with streaming SSR and deferred data
- **React 19** (Server Actions, useOptimistic, improved Suspense)
- **Bun** runtime (50x faster than Node)
- **Turbopack** for instant HMR
- **Tailwind CSS v4** (CSS-first, zero JS overhead)

### Performance Architecture
- **Islands Architecture**: Zero-JS server components, selective hydration
- **Edge-first**: Cloudflare Workers with Durable Objects
- **Signals**: Legend State for fine-grained reactivity
- **Streaming**: Parallel data fetching with defer()
- **Native prefetching**: Speculation Rules API

### Target Metrics
- TTFB: < 50ms
- FCP: < 0.5s
- LCP: < 1.5s
- Bundle: < 50KB initial JS

## Scope

### In Scope
1. **apps/playground**: Refactor to unified patterns (reference implementation)
2. **apps/dumphim**: Migrate from Supabase client to Drizzle server queries
3. **Documentation**: Update patterns doc with migration guides
4. **Tooling**: Shared configurations (Tailwind, TypeScript, ESLint)

### Out of Scope
- apps/manual-co (keep as Next.js reference for now)
- apps/earth (evaluate separately as visualization demo)
- New features (this is architectural standardization)

## Success Criteria

- [ ] All RR7 apps follow identical directory structure
- [ ] All apps achieve Core Web Vitals score 90+
- [ ] Server Components render 70% of content (zero JS)
- [ ] Developer can onboard to any app in < 30 minutes
- [ ] Build times < 5 seconds with Turbopack

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| RR7 rewrite announced | Medium | High | Keep migration paths documented; can pivot to TanStack Start |
| Bun compatibility issues | Low | Medium | Test thoroughly; fallback to Node if needed |
| Breaking changes in React 19 | Medium | Medium | Use canary builds now; pin versions |
| Migration breaks existing features | High | High | Comprehensive tests before merging |

## Timeline

**Phase 1** (Week 1): Foundation
- Upgrade React Router 7 with streaming
- Switch to Bun runtime
- Configure Turbopack

**Phase 2** (Week 2-3): Migration
- Refactor playground as reference
- Migrate dumphim to server patterns
- Extract shared configurations

**Phase 3** (Week 4): Polish
- Performance optimization
- Documentation updates
- Team onboarding

## Stakeholders

- **Engineering Team**: Primary implementers
- **Design Team**: Input on component patterns
- **Future Contributors**: Beneficiaries of unified patterns

---

**Decision**: Approved for implementation  
**Owner**: Engineering Team  
**Priority**: High (blocks Season 2 experiments)
