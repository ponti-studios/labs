# Glass — Rewrite Checklist

**Product brief:** [Glass](04-glass-brief.md)  
**Source:** `apps/labyrinth/app/routes/experiments.glass.tsx`

## Preserve

- [ ] Preserve the SVG displacement pipeline and chromatic-aberration model.
- [ ] Preserve direct manipulation of the glass surface.
- [ ] Preserve before/after control of the optical effect.

## Remove

- [ ] Remove the generic settings-panel presentation.
- [ ] Remove unexplained raw slider ranges and arbitrary control density.
- [ ] Remove fragile fixed-size and mouse-only assumptions.

## Rebuild

- [ ] Make the glass surface read as a physical lens rather than an outlined SVG.
- [ ] Make the effect legible immediately on the supplied image.
- [ ] Add a small set of meaningful optical states or presets.
- [ ] Make the background image and filter state understandable.
- [ ] Define touch, keyboard, resize, and image-failure behavior.

## Verify

- [ ] Dragging the lens produces an unmistakable physical response.
- [ ] The user can compare distortion with no effect.
- [ ] The optical metaphor remains clear without reading the controls.

## Complete when

- [ ] The visitor believes they are manipulating a digital piece of glass.
