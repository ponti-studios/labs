# Theatre Screen Allocation Brainstorm

Status: discovery

## Why this doc exists

The current `ScreenAllocation` concept is headed in the right direction, but the `Market Baseline` input is probably too confident for the user.

Theater owners do not actually know, with any real precision, what weekly attendance will be before they program the screens. In practice, they choose what movies to play and how many screens to give each one. If we ask them to enter a demand baseline, we risk making the simulator feel fake, brittle, or misleading.

This note is a working space to rethink the model together before we lock anything in.

## What we are trying to preserve

- The fantasy-football feel
- A screen roster that stays fully allocated
- Attendance as a derived outcome, not a directly controlled number
- Theater owners only making the decisions they can actually make
- Clear, explainable economics
- A compact operational UI, not a forecasting tool pretending to be exact

## What feels wrong today

- `Market Baseline` suggests the user can estimate demand accurately
- The number implies a precision theater operators do not have
- It makes the model feel more deterministic than the real business is
- It may encourage false confidence instead of useful exploration

## Another layer to consider

Films themselves have audience awareness and pull.

That is a different kind of signal from theater demand:

- theater demand is about the building, the trade area, and the season
- title demand is about the movie's awareness, buzz, cast, franchise strength, and social reach

This matters because a theater owner may not know weekly attendance, but they can react to how strong or weak the film slate feels.

Potential sources of that signal:

- social media volume
- search interest
- trailer engagement
- franchise history
- vendor-style title awareness scores

That gives us a possible middle layer between booking choice and attendance.

## Core product question

How do we let a user explore screen allocation strategy without asking them to pretend they know weekly attendance in advance?

## Candidate directions

### 1. Lineup only

The user chooses the screen mix, and the model derives attendance from the mix alone.

Possible shape:

- lineup drives demand
- season drives a broad multiplier
- the theater’s size sets the ceiling

What this solves:

- removes the need for an artificial market input
- keeps the model easy to understand
- matches how exhibitors actually influence performance

Tradeoff:

- less room to express that some theaters are naturally stronger or weaker markets
- we need good heuristics for how much each film category pulls demand

### 2. Lineup + season

The user chooses the screen mix, and the model applies a broad seasonality preset.

Possible shape:

- lineup drives demand
- season adjusts the whole theater up or down
- screen capacity still caps the result

What this solves:

- keeps the model grounded without asking for a fake demand estimate
- gives us one coarse external factor that users can understand

Tradeoff:

- still slightly abstract
- season may feel too blunt unless the labels are simple and believable

### 2b. Lineup + title strength

Treat each film category as having an implicit market pull score.

Possible shape:

- tentpole titles pull harder than indie holdovers
- the model weights screen allocation by title strength
- title strength is informed by public signals, not user guesswork

What this solves:

- keeps the user away from fake market estimates
- lets outside research improve the model without asking the user to do the forecasting

Tradeoff:

- requires the product to define how title strength is measured
- risks overfitting if the signal becomes too specific

### 3. Theater archetypes

Replace freeform demand with a few theater types.

Examples:

- suburban multiplex
- urban arthouse
- family-heavy trade area
- mixed-format entertainment center

What this solves:

- avoids fake precision
- still lets users express structural differences between theaters

Tradeoff:

- less granular
- still somewhat subjective
- easier to overfit than a lineup-only model

### 4. Scenario bands instead of a single forecast

Show a range, not a point estimate.

Examples:

- cautious
- expected
- upside

What this solves:

- matches uncertainty better
- feels more honest

Tradeoff:

- more complex than a single number
- the UI has to explain why the range exists

## Questions to settle

- Do we want one forecast, or a forecast band?
- Is lineup + season enough, or do we need theater archetypes too?
- Should title strength be a separate layer from theater demand?
- What is the minimum number of controls that still makes the model useful?
- What should the user feel responsible for: booking, mix, pricing, or all three?

## My current leaning

The cleanest direction may be:

- remove the freeform `Market Baseline`
- keep the user focused on booking and screen allocation
- keep season as a simple preset if we need one external factor
- consider title-strength signals if we want to reflect real slate heat
- show derived attendance as a range or confidence band if the model needs uncertainty
- otherwise keep it lineup-only and let the strategy live in the roster

That would keep the simulator grounded without pretending theater owners can forecast demand to the unit.

## Next step

We should decide whether this is:

- a direct-response operating tool with a lineup-only model
- a strategy sandbox with seasonality and scenario outputs

Once that is clear, we can reshape the UI around the right mental model.
