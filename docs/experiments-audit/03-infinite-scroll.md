# Infinite Scroll — Rewrite Checklist

**Product brief:** [Infinite Scroll](03-infinite-scroll-brief.md)  
**Source:** `apps/labyrinth/app/routes/infinite-scroll/route.tsx`, `apps/labyrinth/app/routes/infinite-scroll/main.css`

## Preserve

- [ ] Preserve seamless duplicated-strip looping.
- [ ] Preserve opposing directions and masked entry/exit.
- [ ] Preserve the idea of motion as the primary visual material.

## Remove

- [ ] Remove placeholder imagery and numbered content with no meaning.
- [ ] Remove the generic bordered container if it conflicts with the gallery atmosphere.
- [ ] Remove global CSS leakage from the route stylesheet.

## Rebuild

- [ ] Define a real collection and reason for its existence.
- [ ] Give the piece a minimal but intentional curatorial frame.
- [ ] Make image metadata and dimensions content-driven rather than index-fragile.
- [ ] Define loading, image failure, lazy loading, and layout-stability behavior.
- [ ] Define motion speed, pause, and reduced-motion behavior as part of the experience.

## Verify

- [ ] The collection reads as an atmosphere rather than a scrolling demo.
- [ ] The motion remains smooth and legible across viewport sizes.
- [ ] The piece still works when motion is reduced or paused.

## Complete when

- [ ] The visitor has a reason to stay with the moving field beyond noticing the CSS technique.
