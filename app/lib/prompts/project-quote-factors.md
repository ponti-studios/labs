# Project quote factors

Not rendered on the site. Reference data for a future LLM prompt that analyzes a project spec/brief and estimates which Ponti Studios pricing group and quote range it falls into.

Each pricing group below lists the factors that push a quote toward the high end and the factors that keep it toward the low end. The site itself only shows the general cross-group factors ("What moves any quote" on `/pricing`) — this file is the more granular, per-group version an analysis prompt can reason over.

---

## Advisory

_Technical Consulting, Strategy Workshop_

**Pushes the quote up**

- Large or complex codebase requiring extended review time
- Multiple systems or stakeholders involved
- Synthesis-heavy output — not just findings but implementation-ready recommendations
- High-risk decision with significant downstream consequences
- Workshop requiring custom facilitation design and pre-session research

**Keeps the quote down**

- Narrow scope — one system, one question, one decision
- Async-first — written review without extensive sync sessions
- Existing documentation that accelerates the review

---

## Visual Production

_Visual Production_

**Pushes the quote up**

- Multiple locations or shooting days
- Talent coordination and casting
- Video in addition to photography
- Large shot list with high post-processing volume
- Campaign-level production with broader commercial use

**Keeps the quote down**

- Single location, focused shot list
- Light post-processing
- Photography only

---

## Ongoing Partnership

_Fractional Product Management, Content Strategy_

**Pushes the quote up**

- More weekly hours and active involvement
- Multiple stakeholders or teams to coordinate across
- Heavier experimentation, reporting, or content production volume
- High-stakes roadmap decisions requiring strategic depth
- Execution management in addition to advisory

**Keeps the quote down**

- Lighter cadence — strategy and oversight without daily execution
- Single focused workstream
- Stable team that needs direction, not coordination

---

## Design & Brand

_Copy & Messaging, Product Design, Brand Identity_

**Pushes the quote up**

- Many screens, flows, or user types
- Deep user research before design begins
- Design system built from scratch (not adapted from an existing one)
- Brand creation (not extension) — starting from no identity
- Multiple audiences requiring distinct messaging
- Website and marketing assets included alongside core identity work

**Keeps the quote down**

- One focused product area or flow family
- Light research — assumptions already validated
- Brand extension — existing identity in good shape, needs refinement
- Standalone copy engagement without accompanying visual work

---

## Product Build

_Engineering, Modernization_

**Pushes the quote up**

- Multiple user roles with distinct permissions and workflows
- Complex backend logic, data models, or algorithmic requirements
- Third-party integrations that require custom connectors
- Mobile in addition to web
- Timeline compression — faster delivery requires more parallel capacity
- Regulated industries with compliance or audit requirements

**Keeps the quote down**

- Narrow scope with one core workflow
- Standard infrastructure with few integrations
- Clear, stable requirements before we start
- Flexible timeline
