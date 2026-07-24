# [Product or Feature] — Design Rationale & Implementation Brief

> **Status:** Draft | In review | Approved | Implemented  
> **Owner:** [Name or team]  
> **Last updated:** [YYYY-MM-DD]  
> **Related work:** [Links to issue, prototype, design discussion, PR, or previous document]

## Purpose

State what this document is for: the product or feature being changed, the decision it records, and the outcome it should enable. This is the durable record of *why* the selected design direction exists and the practical brief for implementing it.

## Executive summary

In two to five sentences, describe:

- The user or product problem.
- The selected design direction.
- The central reason it was chosen.
- The intended result once implemented.

## Context

### Product context

Explain where this experience sits in the product, who uses it, and what job they are trying to complete.

### Why change now

Describe the trigger for the work: a product need, a quality gap, user feedback, a new capability, a visual-system evolution, or a change in strategy.

### Current experience

Summarize the current state. Include screenshots, recordings, or links where useful. Be specific about what is working and what is not.

## Goals, principles, and constraints

### Goals

- [Goal 1]
- [Goal 2]
- [Goal 3]

### Design principles

List the principles that should guide tradeoffs. These should be specific enough to rule something in or out.

- [Principle, e.g. “Make the daily task feel immediate, not like a dashboard.”]
- [Principle]
- [Principle]

### Constraints

Capture real boundaries, including technical, content, platform, brand, accessibility, performance, schedule, and dependency constraints.

- [Constraint]
- [Constraint]

### Non-goals

Name worthwhile work that is explicitly outside this change, so implementation does not silently expand.

- [Non-goal]
- [Non-goal]

## Evidence and inputs

Record the material that informed the work. Distinguish evidence from assumptions.

| Input | What it showed | Implication for the design |
| --- | --- | --- |
| [User feedback / research / analytics / stakeholder discussion] | [Finding] | [Design implication] |
| [Input] | [Finding] | [Design implication] |

### Assumptions to validate

- [Assumption]
- [Assumption]

## Exploration

Document the meaningful directions explored. This section preserves useful thinking without treating every draft as equally viable.

### Direction A — [Name]

**Intent:** [What this direction attempted to achieve.]

**What worked:**

- [Strength]

**What did not work:**

- [Weakness or risk]

**Decision:** [Advanced / combined with another direction / set aside.]  
**References:** [Links or images]

### Direction B — [Name]

**Intent:** [What this direction attempted to achieve.]

**What worked:**

- [Strength]

**What did not work:**

- [Weakness or risk]

**Decision:** [Advanced / combined with another direction / set aside.]  
**References:** [Links or images]

### Synthesis

Explain how the explorations changed the team’s understanding of the problem and what was carried into the final direction.

## Selected direction

### The decision

State the chosen direction plainly. A reader should understand what will be built without reading the exploration section.

### Why this direction

Connect the decision directly to the goals, principles, evidence, and constraints.

- [Reason 1]
- [Reason 2]
- [Reason 3]

### Tradeoffs accepted

Every direction gives something up. Name the tradeoffs, why they are acceptable, and what will mitigate them if relevant.

| Tradeoff | Why we accept it | Mitigation or follow-up |
| --- | --- | --- |
| [Tradeoff] | [Reason] | [Plan] |

## Experience and visual guidance

Describe the experience as a whole before specifying components.

### Intended feeling

[A concise description of the emotional and perceptual quality of the experience.]

### Hierarchy and layout

Explain what users should notice first, second, and third; the role of whitespace; density; grouping; and page or screen structure.

### Typography, color, and imagery

Document the selected visual language and its purpose. Reference existing design-system tokens and components where applicable; identify any proposed additions as proposals, not settled system changes.

### Interaction, feedback, and motion

Describe interaction states, transitions, confirmation, error recovery, and motion intent. Keep motion purposeful and account for reduced-motion preferences.

### Content and voice

Note important language principles, content hierarchy, labels, empty states, and any tone constraints.

## Implementation brief

### Scope of change

| Area | Change | Notes / dependencies |
| --- | --- | --- |
| [Screen, component, route, or flow] | [What changes] | [Dependency or note] |

### Key states and responsive behavior

List the states that must be designed and implemented, including loading, empty, error, success, disabled, long-content, and mobile/small-screen behavior where relevant.

### Accessibility requirements

- [Keyboard, focus, semantic structure, contrast, target-size, screen-reader, reduced-motion, or other requirement]
- [Requirement]

### Analytics or validation plan

State how the work will be evaluated after release: qualitative feedback, task completion, engagement, support signals, performance measures, or a defined review date.

## Open questions and follow-ups

| Question or follow-up | Owner | Decision needed by | Status |
| --- | --- | --- | --- |
| [Item] | [Owner] | [Date or milestone] | [Open / resolved] |

## Decision log

Add an entry when a material decision changes. This keeps the rationale trustworthy as the work evolves.

| Date | Decision | Rationale | Owner |
| --- | --- | --- | --- |
| [YYYY-MM-DD] | [Decision] | [Why] | [Name] |

## References

- [Design discussion]
- [Prototype or design file]
- [Related issue or pull request]
- [Relevant design-system guidance]
