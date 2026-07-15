# Calendar — Rewrite Checklist

**Product brief:** [Calendar](01-calendar-brief.md)  
**Source:** `apps/labyrinth/app/routes/experiments.calendar.tsx`

## Preserve

- [ ] Preserve the distinction between foreground activity and surrounding context.
- [ ] Preserve split events, collisions, nested commitments, and transit as meaningful relationships.
- [ ] Preserve the idea that past, present, and future belong to one temporal surface.

## Remove

- [ ] Remove the finite mockup framing and hardcoded date/time assumptions.
- [ ] Remove card-first presentation that makes time feel like isolated appointments.
- [ ] Remove dead controls and misleading drag affordances.
- [ ] Remove layout behavior that depends on magic pixel offsets.

## Rebuild

- [ ] Represent every minute as part of one continuous vertical stream.
- [ ] Make infinite vertical navigation across past, present, and future the primary interaction.
- [ ] Make the current moment unmistakable within the stream.
- [ ] Make actual time spent easy to inspect retrospectively.
- [ ] Show one foreground activity with overlapping contexts around it.
- [ ] Make transitions, open time, overlap, and containment legible.
- [ ] Derive the displayed date and time from real temporal state.
- [ ] Replace duplicated event rendering with a coherent temporal representation.

## Verify

- [ ] A visitor understands the stream without being told it is a calendar redesign.
- [ ] Looking backward reveals the shape and reality of time spent.
- [ ] Looking forward does not break the continuity of the surface.
- [ ] The experience remains coherent with sparse, dense, overlapping, and nested time.
- [ ] Keyboard, touch, focus, reduced motion, and responsive behavior are verified.

## Complete when

- [ ] The experience makes “my day is not a list; it has a shape” immediately legible.
