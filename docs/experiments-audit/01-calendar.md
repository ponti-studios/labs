---
vision: vision.md
type: product
challenge: >
  How can people use time honestly when calendars show plans but hide lived reality?
thesis: >
  The correct calendar is an infinite vertical stream: a linear view of every minute, where one foreground activity is surrounded by overlapping contexts across the past, present, and future.
assumption-challenged: >
  Time should be divided into bounded calendar boxes, and overlapping commitments should be treated as separate or exceptional events.
audience-and-moment: >
  A person planning their day, inhabiting the present moment, or looking back to understand where their time actually went.
promise: >
  See the shape of lived time clearly enough to make future use of time more honest.
moment-of-discovery: >
  The user sees their whole temporal reality in one stream: what they are doing now, what surrounds it, what happened before, and what is waiting ahead.
design-status: discovery
last-design-decision: >
  Borrow the continuous vertical behavior of a feed without using repeated feed-item grammar. The stream must make time—not events—the primary visual substance, with now acting as the seam between settled past and provisional future.
---

# Calendar — Product Brief & Rewrite Checklist

## Purpose

Help people use time honestly by showing the reality of time spent and making the real past easy to see. Looking backward is the feedback loop that makes future planning more truthful.

## Core model

Time is linear and continuous. Every minute exists. The correct spatial model is an infinite vertical stream across past, present, and future—not a monthly grid or a collection of bounded event boxes.

A person has one foreground activity at a moment, but multiple contexts can overlap around it: a conversation, a livestream, background processes, a future commitment, a location, or a personal state. These contexts should be related to the moment without pretending they are four equal primary activities.

The continuity belongs to the temporal model, not necessarily to the pixel geometry. We do not need to create empty vertical space between events to prove that time passed. Time can remain continuous through ordering, timestamps, landmarks, duration, and relationships.

The vertical stream may behave like a feed, but it must not be built conceptually from repeated feed items. A feed treats content units as primary and places them in sequence. This experiment treats time as primary; moments, contexts, memories, and intentions alter the shape of that continuous temporal substance.

## Core loop

The user moves through the stream, records or recognizes what occupies a moment, sees surrounding contexts, and looks backward to compare intended time with lived time. That understanding informs the next decision about time.

## Novelty

The calendar treats time—not events—as the primary object. Events become shapes, layers, and relationships within a continuous temporal medium.

The interface should therefore move like an infinite feed without looking like an activity log. A calendar lays appointments onto a measurable grid. An activity feed stacks discrete records. Both make events the basic object. This experience must make the continuity of time perceptible and allow moments, contexts, and intentions to change its shape.

If the first impression is either “calendar” or “activity log,” the rewrite has failed even if the underlying data model is more truthful.

## Canonical scenario

The user is talking to someone, watching a livestream, waiting for image generators to finish in the background, and planning to play tennis in five hours. This is one lived moment with layered contexts and a visible future commitment, not four equal calendar events.

## Discovery and proof

The visitor should recognize: “My day is not a list. It has a shape.” The concept works when the first viewport makes the present moment, its surrounding contexts, and its relationship to past and future legible without explanatory copy doing the conceptual work.

## What the prototypes taught us

The first implementation was still too attached to calendar grammar. It used hour lines, a time spine, bounded event cards, overlapping rectangles, and proportional empty space. On mobile, the result became both unreadable and conceptually ordinary: a compressed version of a familiar calendar.

The second implementation removed the grid, cards, proportional gaps, and timeline geometry. That was necessary, but it exposed a second trap: the experience became a conventional activity log. Each moment still appeared as the same repeated unit—timestamp, title, description, metadata, and nested rows. Events remained the primary objects; they were merely stacked instead of positioned.

The mobile prototype also revealed structural contradictions:

- The showcase explanation and controls delayed the actual experience until deep into the first viewport.
- The page and the calendar both scrolled, making the stream feel like a widget embedded inside a page.
- Automatic positioning centered the current event within the internal scroller rather than within the person’s visible screen, leaving the present partially cut off.
- Strong day dividers made yesterday, today, and tomorrow feel like separate containers rather than landmarks in continuous time.
- The current moment used ordinary active-item styling, making “now” feel selected rather than inhabited.
- Contexts were stacked vertically, which established hierarchy but implied sequence instead of simultaneity.
- Duration became a text label only, so moments with radically different temporal weight acquired the same silhouette.
- Explanatory labels such as “foreground activity” and “contained moment” described the schema instead of letting believable lived material reveal it.

The second prototype was closer in visual vocabulary but had not yet invented a visual model of time.

## Current design position

The mobile experience should use feed behavior without feed-item grammar:

- Moments appear in chronological document flow.
- The page itself is the stream; the component must not create a competing nested scroll surface.
- Day labels are quiet landmarks encountered within time, not headers or section boundaries that reset it.
- Timestamps are metadata attached to moments, not coordinates on a grid.
- The foreground activity is primary, but it is not a generic feed card.
- Contexts must read as concurrent with the foreground activity, not as subsequent rows.
- Now is the organizing seam of the experience, not a destination button or an active-state badge.
- Past, present, and future belong to one surface but have different temporal conditions.
- No artificial empty space is inserted between events.
- Duration and temporal weight must affect the form without returning to proportional calendar geometry.
- Realistic content must demonstrate the model; taxonomy and explanatory copy must not carry the thesis.

This is not a final visual design. It is the current conceptual constraint for the next design pass.

## Emerging temporal model

The stream has three conditions, not three screens or modes:

### Past — settled evidence

The past records what time actually became. It should be dense, factual, and easy to inspect. Its purpose is not nostalgia or analytics; it is the feedback loop that makes future choices more honest.

### Present — expanded lived moment

The present is the most fully resolved part of the stream. One foreground activity is visible together with the contexts that coexist around it. Now should feel inhabited and structurally central, not merely highlighted.

### Future — provisional intention

The future is real enough to shape the present but has not yet become lived evidence. It should remain visible while feeling less resolved and more conditional than the past.

Now is the seam where intention becomes reality. The design should make that transformation perceptible without dividing the experience into separate past and future views.

## Design questions for the next pass

1. What continuous visual substance represents time when events are no longer the containers?
2. How do lived moments alter that substance enough to give a day a recognizable shape?
3. How should duration and temporal weight be felt without proportional empty space?
4. How can contexts read as simultaneous without returning to parallel calendar columns?
5. What makes now feel inhabited and structurally central without drawing a line across the surface?
6. What is the smallest visual distinction between settled past, expanded present, and provisional future?
7. How does the past become easy to inspect without becoming an archive, dashboard, or activity log?

## Next design phase

Do not patch the current row design. Before writing more implementation, define the temporal substance and the three conditions it passes through:

1. Settled past.
2. Expanded present.
3. Provisional future.

Within that model, define a lived moment, an accompanying context, and a day landmark. Then test the system against a sparse day, the canonical layered present moment, and a dense overlapping past.

The test passes only if the result is one continuous page-level stream, the current moment is complete in the first viewport, concurrency is immediately legible, and the result resembles neither a conventional calendar nor a conventional activity feed.

## Non-goals

This is not a task manager, productivity scorecard, monthly planner, or prettier Google Calendar. It is not an argument that every minute must be optimized or filled. Rest, uncertainty, and open time are part of lived time.

## Rewrite checklist

### Preserve

- [ ] Preserve the distinction between foreground activity and surrounding context.
- [ ] Preserve split events, collisions, nested commitments, and transit as meaningful relationships.
- [ ] Preserve the idea that past, present, and future belong to one temporal surface.

### Remove

- [ ] Remove the finite mockup framing and hardcoded date/time assumptions.
- [ ] Remove card-first presentation that makes time feel like isolated appointments.
- [ ] Remove repeated feed-row presentation that makes moments feel like interchangeable records.
- [ ] Remove the nested calendar scroll surface; the stream must own the page-level vertical movement.
- [ ] Remove showcase framing that delays the discovery beyond the first viewport.
- [ ] Remove dead controls and misleading drag affordances.
- [ ] Remove layout behavior that depends on magic pixel offsets.
- [ ] Remove schema-explaining labels and placeholder copy from the canonical scenario.

### Rebuild

- [ ] Represent every minute as part of one continuous vertical stream.
- [ ] Make infinite vertical navigation across past, present, and future the primary interaction.
- [ ] Treat continuity as an ordering and relationship model, not a requirement to render empty vertical duration.
- [ ] Use the continuous movement of a feed without inheriting repeated feed-item grammar.
- [ ] Make now the seam between settled past and provisional future.
- [ ] Make the current lived moment complete and unmistakable in the first viewport.
- [ ] Make actual time spent easy to inspect retrospectively.
- [ ] Show one foreground activity with overlapping contexts around it.
- [ ] Make overlapping contexts read as simultaneous rather than sequential.
- [ ] Give duration and temporal weight a perceptible form without proportional empty space.
- [ ] Make day labels landmarks within continuity rather than boundaries around containers.
- [ ] Make transitions, open time, overlap, and containment legible.
- [ ] Derive the displayed date and time from real temporal state.
- [ ] Replace duplicated event rendering with a coherent temporal representation.
- [ ] Remove artificial empty space between events.

### Verify

- [ ] A visitor understands the stream without being told it is a calendar redesign.
- [ ] The first viewport demonstrates the thesis before supporting copy explains it.
- [ ] Looking backward reveals the shape and reality of time spent.
- [ ] Looking forward does not break the continuity of the surface.
- [ ] The experience remains coherent with sparse, dense, overlapping, and nested time.
- [ ] The first impression is neither a conventional calendar nor a conventional activity feed.
- [ ] The page has one obvious vertical scroll surface on mobile.
- [ ] Past, present, and future feel different without becoming separate modes.
- [ ] Keyboard, touch, focus, reduced motion, and responsive behavior are verified.

### Complete when

- [ ] The experience makes “my day is not a list; it has a shape” immediately legible.
- [ ] Time is perceptibly the primary object; moments no longer read as the containers of the interface.
