---
type: design-system
owner: ponti-studios
version: 2.0
status: active
---

# Ponti Studios Design System

The shared system for Ponti Studios products. Its purpose is to make interfaces feel related without making them identical.

## Constitution

The system follows this order:

**Philosophy → Foundations → Components → Patterns → Product expression**

Every decision should become simpler as it moves down this stack. Product expression may be distinctive, but it cannot bypass accessibility, semantic tokens, or component state contracts.

## Ownership

Ponti Studios owns the shared system. Product documents may extend it for Labyrinth, Omiro, or an individual experiment, but extensions must identify their scope and cannot silently redefine a shared token.

## Decision process

1. State the user-facing problem.
2. Check the existing foundation and component contracts.
3. Prototype the decision in Storybook development mode.
4. Review light/dark, narrow/wide, keyboard, and reduced-motion behavior.
5. Record the accepted decision in the narrowest design document.
6. Implement code from the accepted document.

Markdown is the final authority. Storybook is the executable validation lab, not a production deployment target.

## Non-negotiables

- Semantic tokens only in components.
- No hardcoded palette values in component guidance or stories.
- No private coordination variables or deprecated utility vocabulary in the final system.
- Every interactive state has visible and accessible feedback.
- Every fetching state has loading, content, empty, and error behavior where applicable.
- Every visual output preserves its geometry during loading.
- Motion is tokenized and reduced-motion aware.
- Mobile layouts do not overflow.
- Storybook runs in development only. Never run `storybook build`, `build-storybook`, or a static export.

## Evolution

If a component needs a new value, document the gap before adding it. If a product needs an exception, scope and name it. If a foundation changes, update the affected Storybook validation stories before changing consumers.

## Reading order

1. [Philosophy](philosophy.md)
2. [Foundations](foundations.md)
3. [Tokens](tokens.md)
4. [Shared component contract](components/shared.md)
5. [Web components](components/web.md)
6. [Mobile components](components/mobile.md)
