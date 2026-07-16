---
type: foundation
name: accessibility
status: canonical
---

# Accessibility

Accessibility is a system constraint, not a finishing pass.

## Minimum contract

- Text meets WCAG AA contrast: 4.5:1 for normal text and 3:1 for large text.
- Interactive and non-text indicators meet the applicable 3:1 contrast requirement.
- Every interactive element has a visible keyboard focus state.
- Every target is at least 44×44px.
- State is never communicated by color alone.
- Motion responds to `prefers-reduced-motion`.
- Dialogs, sheets, menus, and popovers preserve focus and expose correct labels.
- Errors explain what happened and what the user should do next.
- Forced-colors and high-contrast environments retain recognizable structure.

Stories must demonstrate keyboard focus, disabled behavior, invalid behavior, reduced motion, and narrow-width layout where relevant.
