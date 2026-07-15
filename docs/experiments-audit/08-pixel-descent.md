# Pixel Descent — Rewrite Checklist

**Product brief:** [Pixel Descent](08-pixel-descent-brief.md)  
**Source:** `apps/labyrinth/public/experiments/pixel-descent.*`, `apps/labyrinth/public/experiments/pixel-descent/`

## Preserve

- [ ] Preserve the walker algorithm, seeded generation, palette, and historical setting.
- [ ] Preserve the distinction between individual figures and collective flow.
- [ ] Preserve regeneration and PNG output where they support the artwork.

## Remove

- [ ] Remove the dated wrapper treatment that competes with the artwork.
- [ ] Remove controls that expose implementation detail without improving the piece.
- [ ] Remove loading and rendering ambiguity around the canvas.

## Rebuild

- [ ] Make the canvas the primary artwork and give it an intentional presentation.
- [ ] Make the historical atmosphere and commuter metaphor legible.
- [ ] Define which parameters are part of the artistic experience.
- [ ] Define responsive, HiDPI, browser, and initialization behavior.
- [ ] Keep the custom-element boundary only if it serves the artwork cleanly.

## Verify

- [ ] The visitor notices individual lives inside the crowd.
- [ ] Parameter changes feel like artistic exploration rather than debugging.
- [ ] The artwork remains compelling without touching controls.

## Complete when

- [ ] The piece reads as an intentional algorithmic installation.
