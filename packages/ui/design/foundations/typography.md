---
type: foundation
name: typography
status: canonical
---

# Typography

Typography is hierarchy before decoration. Use the system-native sans family for interface content and a monospace family only when data or code benefits from alignment.

## Roles

| Role | Purpose | Guidance |
| --- | --- | --- |
| Display | page title or primary statement | tight tracking, strong hierarchy |
| Body | readable content and explanation | regular weight, relaxed line height |
| Label | controls, metadata, navigation | medium or semibold when interactive |
| Caption | supporting or tertiary information | quiet, never the only carrier of meaning |

The implementation owns a platform scale, but product surfaces should normally use no more than these four roles in a local context. Do not introduce arbitrary pixel sizes to solve a layout problem.

## Rules

- Headings use approximately 1.2 line-height.
- Body content uses approximately 1.4–1.6 line-height.
- Use tabular numerals where values must be compared.
- Reserve bold weight for meaningful emphasis.
- Preserve readable line length; do not make a wide screen an excuse for long text lines.
