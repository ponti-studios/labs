# Context Chemistry — Rewrite Checklist

**Product brief:** [Context Chemistry](02-context-chemistry-brief.md)  
**Source:** `apps/labyrinth/app/routes/experiments.llm-interface.tsx`, `apps/labyrinth/app/routes/api.gen.predict.ts`

## Preserve

- [ ] Preserve A/B comparison.
- [ ] Preserve block enable/disable and ordering.
- [ ] Preserve the educational help content and token-awareness concept.

## Remove

- [ ] Remove identical presentation for system, user, and assistant context.
- [ ] Remove misleading drag handle behavior when the interaction is click-to-move.
- [ ] Remove generated output presentation that hides the distinction between input and response.
- [ ] Remove comparison behavior that silently overwrites the other configuration.

## Rebuild

- [ ] Make context roles visually and semantically distinct.
- [ ] Make the causal experiment—change one condition, compare the result—immediately obvious.
- [ ] Give Configuration A and B a clear relationship and independent reading path.
- [ ] Allow the user to intentionally define a block's role.
- [ ] Make generated output feel like an observed result, not another editable input.
- [ ] Make token counts honest about their estimate and model context.
- [ ] Define a clear completion and error state.

## Verify

- [ ] A first-time visitor can run a meaningful A/B experiment without instruction.
- [ ] The changed context block and changed output can be compared without mental bookkeeping.
- [ ] Empty, invalid, slow, and failed generations are understandable and recoverable.
- [ ] Keyboard navigation and large-context editing remain usable.

## Complete when

- [ ] The interface makes “context changes intelligence” visible through one simple experiment.
