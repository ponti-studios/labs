# ThreeGL AI Explainer — Rewrite Checklist

**Product brief:** [ThreeGL AI Explainer](05-threegl-ai-explainer-brief.md)  
**Source:** `apps/labyrinth/app/routes/experiments.threegl-ai-explainer.tsx`

## Preserve

- [ ] Preserve the layer-by-layer particle flow.
- [ ] Preserve dynamic loading and explicit GPU resource cleanup.
- [ ] Preserve meaningful controls for layers, particles, speed, and running state.

## Remove

- [ ] Remove debug-aid presentation that makes the scene read like a tutorial.
- [ ] Remove abrupt particle wrap-around and visually empty rebuilds.
- [ ] Remove controls that change complexity without clarifying the model.

## Rebuild

- [ ] Make each layer's conceptual role legible in the scene.
- [ ] Make particle movement communicate transformation, not merely travel.
- [ ] Give the scene visual depth while preserving causal legibility.
- [ ] Define camera orientation and motion for first viewing and demonstration.
- [ ] Define performance behavior across capable and constrained devices.

## Verify

- [ ] A visitor understands that the layers represent stages of transformation.
- [ ] The visual treatment does not overwhelm the explanatory idea.
- [ ] Controls produce immediate, intelligible changes.
- [ ] Reduced motion and WebGL failure states are handled.

## Complete when

- [ ] Complexity feels understandable because the visitor can see it transform.
