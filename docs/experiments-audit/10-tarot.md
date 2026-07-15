# Tarot — Rewrite Checklist

**Product brief:** [Tarot](10-tarot-brief.md)  
**Source:** `apps/labyrinth/app/routes/tarot.tsx`, `apps/labyrinth/app/routes/api.tarot.ts`, `apps/labyrinth/app/lib/tarot-*`

## Preserve

- [ ] Preserve one card per local day.
- [ ] Preserve persistence, hydration, API validation, and curated fallback behavior.
- [ ] Preserve the card data and reflection structure.

## Remove

- [ ] Remove presentation that makes the ritual feel like an ordinary data result.
- [ ] Remove generic treatment that gives every reading section equal emotional weight.
- [ ] Remove drawing states that communicate only waiting.

## Rebuild

- [ ] Make anticipation, draw, reveal, and reflection distinct moments.
- [ ] Make the card and its meanings feel like a coherent ritual object.
- [ ] Make the daily constraint and return-tomorrow behavior meaningful.
- [ ] Define failure and fallback states without breaking the ritual.

## Verify

- [ ] The visitor understands the one-card-per-day constraint.
- [ ] The draw feels intentional rather than instantaneous.
- [ ] The reading invites reflection without claiming objective authority.

## Complete when

- [ ] The experience creates a pause in the day rather than merely displaying tarot data.
