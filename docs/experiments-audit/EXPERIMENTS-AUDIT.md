# Experiments Audit — Rewrite Checklist

This directory is an execution checklist for rewriting the existing experiments.

Product intent lives in the `*-brief.md` files in this directory. These checklists do not define what an experiment means; they record the work required to make the implementation express its product brief.

## Shared checklist

- [ ] Read the linked product brief before changing the experiment.
- [ ] Preserve the experiment's central interaction or technical proof.
- [ ] Remove dead controls, fake data, placeholder content, and misleading affordances.
- [ ] Use design tokens and approved shared primitives where they improve consistency.
- [ ] Give the experiment a distinct composition and identity appropriate to its brief.
- [ ] Define responsive behavior rather than relying on desktop overflow or viewport magic numbers.
- [ ] Define loading, empty, error, and recovery behavior where applicable.
- [ ] Verify keyboard access, focus behavior, touch input, and reduced-motion behavior.
- [ ] Verify the core discovery is understandable without an explanation from the author.
- [ ] Verify the experiment at its intended viewport sizes and supported browsers.

## Experiment checklists

| Experiment | Product brief | Audit checklist | Status |
|---|---|---|---|
| Calendar | [Brief](01-calendar-brief.md) | [Checklist](01-calendar.md) | Not started |
| Context Chemistry | [Brief](02-context-chemistry-brief.md) | [Checklist](02-llm-interface.md) | Not started |
| Infinite Scroll | [Brief](03-infinite-scroll-brief.md) | [Checklist](03-infinite-scroll.md) | Not started |
| Glass | [Brief](04-glass-brief.md) | [Checklist](04-glass.md) | Not started |
| ThreeGL AI Explainer | [Brief](05-threegl-ai-explainer-brief.md) | [Checklist](05-threegl-ai-explainer.md) | Not started |
| Image Generation | [Brief](06-image-generation-brief.md) | [Checklist](06-image-generation.md) | Not started |
| Theatre Management | [Brief](07-theatre-management-brief.md) | [Checklist](07-theatre-management.md) | Not started |
| Pixel Descent | [Brief](08-pixel-descent-brief.md) | [Checklist](08-pixel-descent.md) | Not started |
| Career Resume | [Brief](09-career-resume-brief.md) | [Checklist](09-career-resume.md) | Not started |
| Tarot | [Brief](10-tarot-brief.md) | [Checklist](10-tarot.md) | Not started |
| COVID Analytics | [Brief](11-covid-analytics-brief.md) | [Checklist](11-covid-analytics.md) | Not started |

## Completion rule

An experiment is complete only when its product brief is satisfied in the running experience and every applicable checklist item is verified. A polished surface that does not communicate the brief is not complete.
