# Theatre Screen Allocation Brainstorm

Status: discovery

## Why this doc exists

The current `ScreenAllocation` concept is headed in the right direction, but the `Market Baseline` input is probably too confident for the user.

Theater owners do not actually know, with any real precision, what weekly attendance will be before they program the screens. If we ask them to enter a baseline number, we risk making the simulator feel fake, brittle, or misleading.

This note is a working space to rethink the model together before we lock anything in.

## What we are trying to preserve

- The fantasy-football feel
- A screen roster that stays fully allocated
- Attendance as a derived outcome, not a directly controlled number
- Clear, explainable economics
- A compact operational UI, not a forecasting tool pretending to be exact

## What feels wrong today

- `Market Baseline` suggests the user can estimate demand accurately
- The number implies a precision theater operators do not have
- It makes the model feel more deterministic than the real business is
- It may encourage false confidence instead of useful exploration

## Core product question

How do we let a user explore screen allocation strategy without asking them to pretend they know weekly attendance in advance?

## Candidate directions

### 1. Relative lineup strength only

The user chooses the screen mix, and the model derives attendance from the mix alone.

Possible shape:

- lineup drives demand
- season drives a broad multiplier
- the theater’s size sets the ceiling

What this solves:

- removes the need for an artificial market input
- keeps the model easy to understand

Tradeoff:

- less room to express that some theaters are naturally stronger or weaker markets

### 2. Market profile presets

Replace the freeform baseline with a few plain-language market types.

Examples:

- soft market
- average market
- strong market

What this solves:

- avoids fake precision
- still lets users express structural differences between theaters

Tradeoff:

- less granular
- still somewhat subjective

### 3. Scenario bands instead of a single forecast

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

### 4. Research-backed market archetypes

Use theater archetypes based on public research and industry heuristics.

Examples:

- urban arthouse
- suburban multiplex
- family-heavy trade area
- mixed-format entertainment center

What this solves:

- keeps the model grounded in real patterns
- gives the user an understandable starting point

Tradeoff:

- requires stronger research and better calibration
- may be overkill for the current prototype

## Questions to settle

- Do we want one forecast, or a forecast band?
- Should the user pick a market type instead of entering a number?
- Is the market setting even necessary, or can lineup + season + capacity do enough on their own?
- What is the minimum number of controls that still makes the model useful?
- What should the user feel responsible for: demand, pricing, mix, or all three?

## My current leaning

The cleanest direction may be:

- remove the freeform `Market Baseline`
- replace it with 3 to 4 market archetypes
- keep season as a simple preset
- show derived attendance as a range or confidence band

That would keep the simulator grounded without pretending theater owners can forecast demand to the unit.

## Next step

We should decide whether this is:

- a direct-response operating tool with a simplified market preset
- or a strategy sandbox with broader scenario outputs

Once that is clear, we can reshape the UI around the right mental model.

