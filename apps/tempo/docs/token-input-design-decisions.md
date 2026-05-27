# Token Input Design Decisions

This document captures the design decisions behind the shared `TokenInput` pattern used by `tempo` for task tags. It is intended to be a durable reference for future work on tasks, calendar events, and any other tagged entities.

## Product principles

1. The primary job is fast capture.
2. The title is the only required field in the task modal.
3. Tags are optional metadata, not mandatory structure.
4. Optional metadata should be invisible by default.
5. Adding metadata should feel like adding context, not filling out a form.
6. The UI should privilege speed over categorization.
7. Users should be able to ignore tags completely without friction.
8. Tags should support later grouping across tasks, calendar events, and other entities.
9. The interaction must stay compact after values are chosen.
10. The entire interface must remain keyboard navigable.

## Concept and naming

11. We moved away from the `projects` concept to a broader `tags` concept.
12. A task can have multiple tags.
13. There is no migration burden from old project data for this pass.
14. Tags are user-facing labels, but uniqueness is enforced through normalized values.
15. New tags receive a default color.
16. Existing tags use the user’s custom color when present, otherwise the default color.
17. Tag color management belongs in user settings, not in the task modal.

## Information architecture

18. The task modal should open title-first.
19. Tags should not appear as a permanent full-width form field.
20. The tags surface should begin as a compact chip row.
21. The add affordance should be a small `+` button rather than an empty control.
22. After a tag is added, the editing input should collapse back into compact chips.
23. Chips should remain visually compact even when multiple tags are present.
24. Chips are read-only except for removal.
25. Clicking a chip should not reopen it for editing.

## Input behavior

26. Opening the tag input should autofocus it immediately.
27. The input should support both search and creation in the same field.
28. This search-create behavior should be reusable beyond `tempo`, not a one-off implementation.
29. The input should normalize ordinary user text into lowercase kebab form.
30. Example normalization: `Deep Work` becomes `deep-work`.
31. Exact normalized matches to existing tags should reuse the existing tag.
32. If the normalized value already exists and is already selected, the user should be told that it already exists and is selected.
33. Duplicate selected values must not be added again.
34. Partial suggestions should not override what the user typed.
35. Pressing `Enter` should create or reuse the exact normalized text the user entered.
36. Pressing `Enter` should not auto-select the top suggestion unless the user explicitly chooses it.
37. The input should add only one tag per pass, then collapse.
38. Selected tags should be excluded from future suggestions.

## Suggestion behavior

39. Suggestions should not appear before the user starts typing.
40. Suggestions should only show when there are actual matches.
41. No dropdown should be shown when there are no matching values.
42. When there are no matches, creation guidance should not appear inside the dropdown.
43. Instead, creation guidance should appear as subtle helper text underneath the input.
44. The helper copy should take the form `Press Enter to create "..."`.
45. Existing matching suggestions should be shown as lightweight reuse options.
46. The suggestion UI should read as “use existing,” not as a heavy command palette.

## Keyboard and focus behavior

47. Normal `Tab` navigation is enough for the first version.
48. We are not using arrow-key token navigation between chips for now.
49. Pressing `Escape` with the tag input open should discard typed text.
50. Pressing `Escape` should close the input.
51. Pressing `Escape` should return focus to the `+` button.
52. Pressing `Backspace` should remove a chip only if that chip is the active/selected target.
53. The interaction must remain fully usable without a mouse.

## Task-modal integration

54. Tags are part of task creation and editing.
55. Dates remain optional and separate from tags.
56. Only the title should be required for submitting a task.
57. Editing an existing task should preload its current tags as chips.
58. Removing a tag in edit mode should be immediate and not require confirmation.
59. Adding a new tag in edit mode should use the same flow as create mode.

## Data and API behavior

60. Tasks should store a `tags` array rather than a single `projectId`.
61. The backend should resolve tag strings into existing or newly created tag records.
62. Tag resolution should dedupe normalized values before writing.
63. The database should enforce uniqueness on `(user_id, normalized_name)`.
64. The task-tag join table should enforce uniqueness on `(todo_id, tag_id)`.
65. The app should invalidate `tags` queries alongside `todos` queries after task mutations.

## Shared component intent

66. The reusable UI primitive should be generic around tokens/tags, not tied to tasks or projects.
67. The shared primitive should handle compact chip rendering.
68. The shared primitive should handle inline add mode.
69. The shared primitive should handle duplicate-selection feedback.
70. The shared primitive should support helper text under the field.
71. The shared primitive should support suggestion selection without making suggestions mandatory.

## Current implementation reference

- Shared component: [`/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/token-input.tsx`](/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/token-input.tsx)
- Tempo task modal usage: [`/Users/charlesponti/Developer/labs/apps/tempo/app/components/tasks/to-do/TaskFormModal.tsx`](/Users/charlesponti/Developer/labs/apps/tempo/app/components/tasks/to-do/TaskFormModal.tsx)
- Tag normalization and query contract: [`/Users/charlesponti/Developer/labs/apps/tempo/app/lib/tags.ts`](/Users/charlesponti/Developer/labs/apps/tempo/app/lib/tags.ts)
