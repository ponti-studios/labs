---
type: component-contract
owner: ponti-studios
platform: all
status: canonical
---

# Shared Component Contract

Ponti components are designed for more than one host environment. Web, iOS, and Android should share meaning, hierarchy, and quality without being forced to look or behave identically.

## The four layers

Every component has four layers of design:

1. **Meaning** — what the component communicates and why it exists.
2. **Behavior** — what the user can do and how the system responds.
3. **Expression** — hierarchy, rhythm, material, typography, and motion.
4. **Mechanism** — the platform APIs and interaction primitives used to implement it.

Meaning and behavioral intent remain shared. Expression and mechanism adapt to the host platform.

## Shared quality contract

Interactive components must account for the states that apply to them:

- default;
- hover or pointer feedback, where supported;
- keyboard or system focus;
- pressed or active;
- disabled;
- loading, where work is in progress;
- invalid or destructive, where relevant;
- reduced motion.

Every state must preserve readable contrast, communicate its change without color alone, and remain accessible to the platform’s primary input methods. Interactive targets are at least 44px or platform-equivalent points.

Components share semantic roles for color, content hierarchy, spacing relationships, density intent, and motion purpose. They consume semantic or component tokens rather than raw values.

## Component taxonomy

Components are grouped by the user-facing contract they own, not by implementation complexity:

- `primitives` — small reusable building blocks such as buttons, labels, cards, and avatars;
- `forms` — controls that collect, edit, or validate user input;
- `feedback` — loading, progress, alert, and status communication;
- `overlays` — temporary surfaces that interrupt or extend the current context;
- `navigation` — movement between views or persistent wayfinding;
- `data-display` — structured presentation of information;
- `layout` — spatial and scrolling behavior.

Product-shaped patterns belong in shared UI only after more than one product demonstrates a need for them. A component used by one product remains owned by that product.

## First-class platforms

Native is not the quality baseline and web is not its lesser form. Each platform is first-class when it uses its own strengths to deliver the same level of clarity, responsiveness, and care.

Do not make the web imitate native. Make the web feel complete on its own terms. Do not make native reproduce web markup. Map the shared user goal to the host platform’s conventions.

## Decision test

When a platform implementation differs, ask:

1. Is the user-facing meaning still the same?
2. Is the behavioral outcome still equivalent?
3. Does the difference use a genuine platform strength or constraint?
4. Is accessibility preserved for that platform?

If the answer to the first two questions is no, the implementations have drifted. If the answer to the third is no, the difference is probably decorative imitation.
