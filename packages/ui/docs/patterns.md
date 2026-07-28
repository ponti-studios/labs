# Patterns

Pass/fail rules for how primitives assemble into a screen.

## Screen structure

1. Every screen has one identifiable purpose.
2. Every screen has one primary action, expressed as one `default` Button.
3. The primary action is visible in the initial viewport, unscrolled.
4. Every screen has one title, naming the user task, never the implementation
   (e.g. `Calendar`, not `Sync engine`).
5. A screen has at most three hierarchy levels: title, section, content.
6. Decorative hero sections, slogans, and filler content are prohibited.
7. A screen must remain understandable with all icons removed.
8. A new layout pattern is not introduced when an existing pattern already fits.

## Surfaces and containment

9. A section is typography and space by default. A Card or SurfacePanel
   exists to group related content that benefits from visual containment —
   metrics, summaries, grouped settings — never to indicate arbitrary state
   through a background or border.
10. Dialog, Sheet, Card, and SurfacePanel are the only components allowed a
    visible container (background separation, radius, elevation). Nothing nests
    inside itself: no sheet inside a sheet, no dialog inside a dialog.
    10a. `--border-default` is the standard border on inputs, cards, and
    containers. A `divider` line between list rows is a named exception — used
    only when adjacent rows would be genuinely ambiguous without it. "It
    looked bare" is not a reason to add a border.
11. One semantic group gets exactly one Section — never a Section inside a Section.
12. Most UI uses `--shadow-none`. Elevated surfaces (Card, Sheet, Dialog,
    DropdownMenu) may use shadows from the scale to separate from the
    background. Pick the lowest shadow that achieves the separation.
13. If two rows on one screen carry a container, they share the same treatment
    — never a mix of bordered and unbordered rows on one list.
14. Gradients and purely decorative shadows are prohibited. A shadow exists
    to separate a surface, not to decorate it. Borders use `--border-default`.
15. FilterChip and Badge are restricted to compact status, filters, and tags
    — they are not a substitute for a button or a card.
16. Radius is chosen from the defined scale. A component uses the radius its
    contract specifies — a button does not pick `--radius-xl` just to stand out.
    Nothing is ever "a bit more rounded" than the scale provides.

## Spacing and sizing

17. Mobile content uses 16px as the horizontal gutter.
18. All spacing comes from the spacing scale. The 4px unit is for internal
    control alignment, never a group gap.
19. Touch targets are at least 44×44pt.
20. Text inputs and primary buttons use their defined size contracts.
21. Content never touches the screen edge.
22. Spacing, oversized type tokens, or oversized surfaces are not used to
    create drama — pick the token the content's actual hierarchy calls for.

## Typography and copy

23. Use sentence case everywhere copy appears.
24. Uppercase is reserved for `SectionIntro` eyebrow text and reference tags.
    All-caps UI copy, slogans, and feature taglines are otherwise prohibited.
25. Metaphors for ordinary features are prohibited.
26. Do not use "lens," "hub," "workspace," "journey," "magic," or
    "intelligence" unless the word names a concrete user concept the feature
    actually implements.
27. Titles describe the task: `Calendar`, `Archived chats`, `Account`.
28. Button labels use a verb and are two words or fewer whenever possible.
29. Labels describe the resulting action, not the component (`Delete chat`,
    not `Delete button`).
30. Placeholder text describes the expected input, not a hint of tone.
31. A title is never repeated in a subtitle beneath it.
32. An action is not explained when its label already makes it obvious.
33. Error copy states the problem and the recovery action in one sentence.
34. Empty states state what is absent and what to do next.

## Loading and async interaction

35. Loading states use a Spinner or Skeleton, never words.
36. `Loading…`, `Saving…`, `Asking…`, or equivalent loading copy is
    prohibited on-screen; that meaning lives in the Spinner's accessible label.
37. A control preserves its committed dimensions while loading.
38. Duplicate interaction is disabled while an action is loading.
39. Every Spinner has an accessible label.
40. Skeletons are used for content loading; Spinners are used for action
    loading. Not interchangeable.
41. Every async action defines success, empty, error, and retry states.

## State and interaction

42. Every feature defines initial, loading, success, empty, error,
    permission-denied, unavailable, and offline states before it ships.
43. Visible controls always represent the current state — no stale control
    left over from a previous state.
44. Setup controls (auth, permissions, configuration) do not appear on the
    task surface; they live in their own flow.
45. Debug controls do not appear in production UI.
46. A manual status check is not shown when status can load automatically.
47. A List row is either `navigational` or `actionable`, never ambiguously both.
48. If a row has an inline action, the row itself is not tappable.
49. Every async action prevents duplicate submission.
50. Destructive actions require explicit confirmation via AlertDialog.
51. Navigation is always reversible with the platform back gesture.
52. A Dialog is used for confirmation only, never for content that deserves
    its own screen.
53. A screen is used for substantial content, never for a single confirmation.
54. Icon-only actions require an accessible label.

## Data and trust

55. Personal data sources are named precisely (e.g. "your iOS Calendar," not
    "your data").
56. Privacy copy describes actual behavior, not a generic assurance.

Good: `Calendar data is processed on this device.`
Bad: `Your data is always safe.`

57. Source metadata is shown only when it helps a user verify a result.
58. Raw implementation details are not shown by default.
59. Personal data is not persisted solely to reproduce UI.
60. The app never implies it can do something the underlying integration
    cannot do.
61. Uncertainty in an answer is expressed in the copy, not hidden behind
    confident styling.

## Visual language

62. `--primary` and `--destructive` communicate action and status. `--success`
    and `--warning` communicate state. Chart colors are reserved for data
    visualization. Everything else renders in `--text-primary`,
    `--text-secondary`, or `--tertiary` as its hierarchy calls for.
63. Icons communicate state or action. Decorative icons are prohibited.
64. Animation communicates a state change or spatial relationship, using a
    duration token from Foundations.
65. Every animation resolves under reduced motion. No element may be
    invisible, displaced, or cut off in its static resting state.
66. An existing token is used before a new one is proposed.
67. An existing `@ponti-studios/ui` component is used before a new one is proposed.
68. A new component requires a behavior none of the existing primitives can
    express — documented in the PR description.
69. Route files compose primitives; they do not invent design systems.
70. Hardcoded colors, radii, spacing values, font sizes, or durations in
    screen code are prohibited — every value must resolve to a token from
    Foundations.

## Accessibility

71. Every interactive element has an accessible name.
72. Every interactive element has a 44×44pt touch target.
73. Body text meets WCAG AA contrast against `--background` at every text
    level used for reading copy.
74. Focus, pressed, disabled, loading, and error states are each
    distinguishable by more than color alone — pair with a fill, ring, or
    icon change.
75. Color is never the sole indicator of state (pair with icon, text, or shape).
76. Dynamic content has an accessibility announcement or a stable reading order.
77. The screen remains usable at the largest supported dynamic type size.
78. Horizontal scrolling is never required to discover a primary action.

## Interaction verification

79. A user-visible change is unverified until it is observed on its target
    device or browser in every changed state: idle, active/focused or loading,
    cancellation/error where applicable, and return/recovery.
80. Before adding controls to a constrained region, the complete composition
    must be verified at the smallest supported viewport or container. Each
    control must remain visible, reachable, and legible; overlap, clipping,
    and undiscoverable actions fail review.
81. An interactive control passes only when automation or equivalent direct
    observation proves both its activation and its resulting state. Rendering,
    an accessible label, or a successful type check alone does not prove the
    interaction works.
82. App-owned controls require deterministic identifiers or another documented,
    reliable observation path. A platform primitive that cannot supply one is
    an implementation constraint to resolve or report before completion.
