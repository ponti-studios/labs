# Review gates

A screen fails review if:

- its purpose cannot be stated in one sentence;
- it has more than one `default` Button as a primary action;
- it contains decorative copy;
- it contains a container, border, or background tint that a bigger gap or a
  heavier type token could have replaced (Ceremony budget, Rule 9, 10a);
- it contains a nested surface (Rule 10);
- it uses a value or pattern outside Foundations–Primitives without a
  documented exception;
- it exposes implementation details by default;
- the first viewport does not show the task and the primary action;
- any required state (Rule 42) is missing;
- any visible control is invalid for the current state;
- a changed interaction lacks target-environment evidence for its required
  states and transitions (Rules 79–82); or
- a reviewer cannot remove 20% of the UI without reducing functionality.

The governing rule:

> Every visual decision must improve comprehension, action, trust, or state
> visibility. Otherwise, remove it. Every value must come from
> `@ponti-studios/ui` Foundations. Every component must come from
> `@ponti-studios/ui` Primitives. Typography and whitespace are tried first;
> color, border, radius, and containers support hierarchy — they are not the
> vocabulary's default.
