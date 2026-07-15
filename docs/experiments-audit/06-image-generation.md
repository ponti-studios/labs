# Image Generation — Rewrite Checklist

**Product brief:** [Image Generation](06-image-generation-brief.md)  
**Source:** `apps/labyrinth/app/routes/gen.image.tsx`, `apps/labyrinth/app/components/generative-image/`

## Preserve

- [ ] Preserve the structured form state and prompt compilation pipeline.
- [ ] Preserve the six conceptual input areas.
- [ ] Preserve transparency into the compiled prompt.

## Remove

- [ ] Remove identical treatment where it hides the different kinds of creative choice.
- [ ] Remove comma-separated inputs where they obscure structured intent.
- [ ] Remove preview and prompt presentation that treats the output as an incidental screenshot.
- [ ] Remove hidden or ambiguous primary actions.

## Rebuild

- [ ] Make each input area express its own kind of visual decision.
- [ ] Make the relationship between choices, compiled prompt, and image visible.
- [ ] Make generation progress, failure, and recovery understandable.
- [ ] Give the generated image a deliberate presentation and inspectable result state.
- [ ] Define what information is essential to retain between generations.

## Verify

- [ ] A visitor understands that the image is the consequence of explicit choices.
- [ ] The prompt is useful as a transparent explanation, not just raw debug text.
- [ ] The user can tell what changed between two generations if comparison is in scope.

## Complete when

- [ ] The experience teaches the translation from visual imagination to structured language.
