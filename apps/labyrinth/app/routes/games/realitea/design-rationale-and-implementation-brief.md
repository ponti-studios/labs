# RealiTea visual redesign — Design Rationale & Implementation Brief

> **Status:** Approved direction — implementation in progress  
> **Owner:** Ponti Studios  
> **Last updated:** 2026-07-23  
> **Related work:** [RealiTea route](./route.tsx), [current styles](./realitea.css), [shared design template](../../../../../packages/ui/design/templates/design-rationale-and-implementation-brief.md), [shared design system](../../../../../packages/ui/design/SYSTEM.md)

## Purpose

This document will record the visual direction selected for RealiTea and turn it into a bounded implementation brief. It exists to preserve the reasoning behind the redesign—not merely to describe a finished interface—so future work can make consistent decisions without reopening the whole exploration.

The immediate project is a style and experience update for the daily RealiTea game at `/games/realitea`. The game mechanics, puzzle generation, validation, persistence, and sharing behavior are not being redesigned unless a later decision explicitly expands scope.

## Source note

The supplied design discussion establishes the Black Lacquer direction. The board and keyboard retain their existing mechanics and hierarchy, but gain a product-specific visual language built from lacquer, champagne-gold frames, and marquee bulbs. The attached discussion is the source for the exploration and decision recorded below.

## Executive summary

RealiTea is a five-letter, six-attempt daily word game built from current reality-TV entertainment news. The current interface is mechanically complete: it serves a local-date puzzle, restores progress, validates guesses, reveals letter states, offers a final clue, and provides a post-game story plus sharing and source actions.

This redesign makes the game feel like a distinctive daily ritual rather than a generic word-game page. The selected direction is Black Lacquer: every tile and keyboard key has a dark lacquer body and champagne-gold frame; bulbs illuminate only after letter evaluation, turning feedback into the marquee language of the game. The implementation is limited to the board, keyboard, and their motion treatment.

## Context

### Product context

RealiTea is presented in Labyrinth as “a word game that reads the news, so it’s never stale.” Each day, a player guesses a five-letter answer drawn from real entertainment journalism. The experience is a compact, repeatable loop: enter a guess, receive per-letter feedback, use the final clue if needed, then read the story and share the result.

The audience is assumed to recognize the reality-TV and entertainment context or be curious enough to learn it through the post-game story. The game must therefore balance two jobs:

1. let an existing fan play immediately without unnecessary explanation; and
2. give a player who does not recognize the answer enough context to understand what they just solved.

### Why change now

The current presentation is functionally sound but visually generic. It uses a conventional bordered header, standard square tiles, neutral card surfaces, and familiar green/gold letter feedback. That gives the game clarity, but it does not yet make a strong, ownable connection between the game’s name, its entertainment-news source material, and the feeling of a daily reveal.

The design discussion is intended to establish a deliberate visual and motion language before implementation begins. The goal is not decoration for its own sake; it is to make the experience more recognizably RealiTea without compromising the puzzle's fast, focused interaction.

### Verified current experience

The current route provides:

- A sticky-on-small-screens header with the RealiTea logo and a “How to play” control.
- An expandable rules card explaining six attempts and the green/gold letter-state meanings.
- A centered six-row board of five square tiles.
- An on-screen keyboard during active play.
- A final clue after five unsuccessful guesses.
- Inline validation feedback, including a shake and error-color animation.
- Per-tile flip reveals for submitted guesses.
- A post-game card with the related story, a share action, and a source-link action.

The route restores progress from local storage and resets it with the daily puzzle. These behaviors are part of the daily-game contract and should remain invisible to the redesign.

## Goals, principles, and constraints

### Goals

- Establish a clear RealiTea point of view that distinguishes the experience from a generic Wordle-style board.
- Keep the primary loop immediate: a player should understand where to look, how to type, and what feedback means at a glance.
- Make the reveal and post-game story feel consequential enough to reward finishing the puzzle.
- Align with Ponti Studios' shared design system while allowing a named, product-scoped RealiTea expression.
- Produce a sufficiently explicit brief that styling work can proceed without re-litigating the visual direction.

### Design principles

- **The board is the instrument.** It remains the primary object on the screen; supporting chrome must not compete with play.
- **Drama belongs to consequence.** Visual intensity is reserved for a submitted guess, a final clue, and the story reveal—not applied continuously to every surface.
- **Entertainment context is earned.** The interface can carry personality, but it should not make the puzzle slower, noisier, or harder to read.
- **Restraint is a feature.** Use space, hierarchy, and material quality before adding decorative elements. This follows the shared system’s principles of interval, omission, and understated depth.
- **Feedback must stay literal.** Letter states, validation, actions, and puzzle status need readable labels and non-color cues where required.

### Constraints

- This is a daily five-letter game with a maximum of six guesses; the board’s geometry must remain stable throughout play.
- Existing user interactions include pointer, physical keyboard, and on-screen keyboard input.
- The game already has loading, validation, active, reveal, game-over, and route-error conditions. The redesign must preserve recognizable feedback for each.
- The layout is used on narrow mobile screens and wider screens. It must not overflow horizontally and must preserve adequate touch targets.
- The shared design system requires semantic tokens, accessible interactive states, reduced-motion behavior, and review across light/dark, narrow/wide, and keyboard interaction.
- RealiTea-specific values currently live as route-local CSS custom properties. Any visual change must decide whether a value is a scoped product expression or warrants a documented shared-token addition.

### Non-goals

- Changing answer length, number of attempts, puzzle sourcing, answer generation, validation rules, or daily scheduling.
- Replacing local progress persistence or the share format.
- Adding a new game mode, leaderboard, account system, or social feed.
- Making undocumented changes to shared design-system tokens or components.

## Evidence and inputs

| Input                                    | What it shows                                                                                                                                                       | Implication for the design                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Current route implementation             | The experience is a focused single-page loop with lightweight help, clue, validation, reveal, story, sharing, and source states.                                    | The redesign should unify these states as one continuous ritual rather than style each as an isolated card.                       |
| Current styles                           | The existing visual language is intentionally conventional: neutral surfaces plus green, gold, and red state colors, with shake and flip animations.                | Distinctiveness should come from a coherent product expression, not from weakening the clarity of the core letter-state feedback. |
| Shared design philosophy                 | Space, omission, honest materials, and restrained intensity are canonical principles.                                                                               | Avoid a dense “entertainment dashboard” treatment or decorative chrome that competes with play.                                   |
| Shared accessibility and motion guidance | Feedback needs visible, accessible states; motion must be purposeful and reduced-motion aware.                                                                      | Any expressive animation must explain a state change and have a reduced-motion equivalent.                                        |
| Design discussion attachment             | The team chose Black Lacquer and refined the bulb treatment from CSS backgrounds to individually positioned bulbs distributed along a responsive rounded perimeter. | Use CSS for visual proportions and JavaScript only for geometry-derived bulb placement.                                           |

### Assumptions to validate

- The desired redesign is presentation- and interaction-led, not a mechanics redesign.
- The existing RealiTea logo remains part of the product identity unless the design discussion says otherwise.
- The post-game story and external source are important narrative rewards, not incidental utility actions.
- The final visual direction must work equally well when a player has no prior knowledge of the news item behind the answer.

## Exploration

### Direction — Black Lacquer marquee

**Intent:** Make the board feel like an intimate, premium entertainment marquee while keeping the puzzle fast and readable.

**Key moves:** Use layered black lacquer gradients for depth, champagne-gold metallic frames, and small bulbs around the rounded perimeter. Keep bulbs off for empty and typed tiles; use green bulbs for correct letters, gold bulbs for present letters, and no power for absent letters. Animate typing with a restrained physical pop and evaluated guesses with a one-time power-on flicker.

**What it clarified:** The bulbs are not decoration. The lacquer is identity; the bulbs are information. Reserving illumination for evaluated letters makes the visual treatment reinforce the game’s state model.

**What did not work:** Repeating radial gradients could not keep bulbs evenly spaced through rounded corners. A prototype with toggleable bulb-count controls also exposed tuning as an implementation concern rather than a user-facing feature.

**Decision:** Selected. CSS defines responsive proportions; JavaScript measures the rendered rounded rectangle and distributes a static, responsive bulb count along its perimeter.

**References:** Supplied design discussion attachment, “Let’s stick with Black Lacquer.”

### Existing baseline — conventional daily word game

**Intent:** Provide a familiar, low-friction word-game experience.

**Key moves:** Centered tile grid; neutral card and border surfaces; logo plus help control; green for correct letters, gold for present letters, red for invalid feedback; tile flip and row-shake animation.

**What works:** The board and keyboard are easy to identify. The mechanics follow established conventions. The board remains central, and the reveal has a clear state-change animation.

**What is unresolved:** The treatment is not yet visibly specific to RealiTea beyond its logo and the post-game story. Supporting content arrives as separate cards rather than as an integrated narrative arc.

**Decision:** Retain as the functional baseline; evolve only where the selected direction improves distinctiveness without reducing clarity.

### Synthesis

The baseline board already had the right interaction model: five stable columns, sequential evaluation, and explicit letter states. The redesign preserves that geometry and the existing game loop, but replaces generic flat tiles with a material system that gives each state a clear role. The exploration also established that responsive geometry belongs in the implementation: bulb density should adapt automatically from mobile to desktop, with no user-facing controls.

## Selected direction

### The decision

Apply the Black Lacquer system to the RealiTea board and on-screen keyboard. Tiles use a dark, layered lacquer face, a champagne-gold masked gradient frame, and individually positioned perimeter bulbs. The keyboard uses the same lacquer and state colors, with compact lit keycaps for evaluated letters. Empty and typed tiles remain unlit; correct and present states illuminate; absent states are desaturated and unpowered.

### Why this direction

- It gives RealiTea an identity that is visible even before a player submits a guess.
- It turns the marquee effect into a semantic feedback language instead of ornamental decoration.
- It preserves the existing board geometry, input model, and state meanings while improving product distinctiveness.
- It scales from mobile to desktop without hardcoded bulb counts or a second visual composition.

### Tradeoffs accepted

| Tradeoff                                                                       | Why we accept it                                                                               | Mitigation or follow-up                                                                                                        |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Individually positioned bulbs require measurement and a small layout observer. | Uniform spacing through rounded corners is more important than a gradient-only implementation. | Keep geometry calculation pure, observe only tile size changes, and render bulbs as non-interactive elements.                  |
| Dark lacquer has less default contrast headroom than neutral surfaces.         | It is the core product identity.                                                               | Use light champagne text, explicit state colors, contrast checks, and preserve existing accessible labels and status messages. |
| The keyboard receives a more expressive treatment than the surrounding cards.  | The board and input are the active game instrument.                                            | Keep header, clue, rules, and completion cards on their existing shared surfaces.                                              |

## Experience and visual guidance

### Intended feeling

An intimate daily entertainment marquee: polished, slightly theatrical, and rewarding at the moment of reveal. It should not become a loud reality-TV promotional page or a dense dashboard.

### Hierarchy and layout

The implementation must retain this hierarchy unless the approved direction explicitly changes it:

1. The active puzzle board and current input state.
2. Immediate feedback: reveal, validation message, final clue, or completed status.
3. The daily game’s identity and lightweight help.
4. The story, sharing, and external-source actions after the game ends.

The board should remain visually stable and centrally anchored. Space around it should create focus, not make the interface feel unfinished. Header treatment, rules presentation, and post-game content may be re-composed, but they should not pull attention from an active guess.

### Typography, color, and imagery

Keep the existing bold uppercase tile lettering, but use a warm champagne letter color on lacquer and light text on evaluated state surfaces. Product-scoped tokens define lacquer blacks, champagne-gold frame stops, green correct bulbs, gold present bulbs, and desaturated absent states. The existing RealiTea logo remains in the header; no new editorial imagery is required for this pass.

The frame is a masked gradient ring rather than a flat border. Bulbs are individual, absolutely positioned elements so their spacing follows the measured rounded perimeter. State is still represented through readable letters and keyboard labels, not color alone.

### Interaction, feedback, and motion

The existing flip reveal is an appropriate baseline because it explains the moment a guess becomes evaluated. The final direction may refine its timing, easing, staging, or companion feedback, but it must remain brief, predictable, and legible.

Required behavior:

- A submitted guess visibly transitions from input to evaluated state.
- Invalid input gives a clear error message and a visible, non-color-only cue.
- The active row remains identifiable while validation is pending.
- The final clue is clearly introduced as a new piece of information, not mistaken for letter-state feedback.
- Post-game content arrives as a completion state rather than an abrupt replacement for the board.
- `prefers-reduced-motion` removes nonessential translation, flipping, and looping while retaining immediate state feedback.

### Content and voice

The game’s copy should remain brief and confident. During active play, content exists to orient or unblock the player; it should not narrate every action. The post-game story is the place to reward curiosity and connect the answer to its entertainment-news source.

The source action must continue to communicate that it opens external editorial context. The share action must remain understandable without relying solely on its icon.

## Implementation brief

### Scope of change

| Area                        | Required change                                                                             | Notes / dependencies                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Route shell and header      | Recompose according to the selected direction.                                              | Preserve a labelled help control and narrow-screen behavior.             |
| Board and tiles             | Apply the selected material, spacing, type, and state treatment.                            | Preserve five-column, six-attempt geometry and readable letters.         |
| On-screen keyboard          | Visually align it with the selected direction.                                              | Preserve physical keyboard support and accessible targets.               |
| Rules and final clue        | Integrate with the final hierarchy and surface system.                                      | Keep rules discoverable and the clue distinct from normal game feedback. |
| Reveal and validation       | Refine state transitions only as approved.                                                  | Must be reduced-motion aware and preserve error messaging.               |
| Game-over story and actions | Make completion feel intentional and narrative.                                             | Preserve share and external source actions with labels and focus states. |
| Scoped styles and tokens    | Replace route-local hardcoded values with documented semantic/scoped values as appropriate. | Do not alter shared tokens without a documented system decision.         |

### Required states and responsive behavior

The design and implementation must explicitly cover:

- Initial loading/hydration while preserving page geometry.
- Active play with an empty row, a partial guess, and an input-validation pending state.
- A valid guess revealing tile by tile.
- Invalid or unrecognized guess feedback.
- Final-clue presentation after the fifth unsuccessful guess.
- Solved and unsuccessful completion states.
- A missing-puzzle route error and a reload action.
- Narrow mobile layout, including safe-area spacing and the on-screen keyboard.
- Wide layout, keyboard focus, dark/light context if supported by the product, and reduced motion.

### Accessibility requirements

- Keep every interactive target at least 44 × 44 px.
- Preserve a visible focus state for the help, keyboard, share, source, and reload controls.
- Announce validation and important status changes without excessive live-region chatter.
- Do not communicate correct, present, absent, or invalid states through color alone; preserve readable text/letter contrast and a distinguishable state treatment.
- Verify WCAG AA text contrast and applicable non-text contrast for state indicators.
- Preserve semantic names for icon-only controls or replace them with visible labels if the selected direction calls for it.
- Implement a reduced-motion variant for every nonessential animation.

### Validation plan

Before approval for implementation, review the selected composition against the actual route in these conditions:

1. First visit and restored in-progress game.
2. Physical keyboard and on-screen keyboard play.
3. Correct, present, absent, and invalid-letter feedback.
4. Five guesses followed by the final clue.
5. Win and loss outcomes, including story, share, and source controls.
6. Small-screen, wide-screen, keyboard-focus, and reduced-motion behavior.

After implementation, validate the existing route tests and add or update route-level accessibility coverage for any changed interaction structure or labels. The route-level implementation and focused geometry tests are the acceptance gate for this direction.

## Open questions and follow-ups

| Question or follow-up                                                                               | Owner                   | Decision needed by | Status |
| --------------------------------------------------------------------------------------------------- | ----------------------- | ------------------ | ------ |
| Review the Black Lacquer treatment at 390px and desktop widths.                                     | Design / implementation | Before merge       | Open   |
| Confirm contrast and reduced-motion behavior in the deployed theme contexts.                        | Design system owner     | Before merge       | Open   |
| Decide whether the scoped keyboard treatment should later graduate into a shared component variant. | Design system owner     | Follow-up          | Open   |

## Decision log

| Date       | Decision                                                                         | Rationale                                                                                                                                                    | Owner         |
| ---------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| 2026-07-23 | Create a design-rationale and implementation brief before styling work.          | The redesign needs a durable record of the visual direction, alternatives, and implementation constraints.                                                   | Ponti Studios |
| 2026-07-23 | Select the Black Lacquer marquee direction for the board and on-screen keyboard. | The supplied exploration established lacquer as identity and bulbs as evaluated-state information, with measured perimeter placement for responsive spacing. | Ponti Studios |

## References

- [Design discussion](https://chatgpt.com/share/6a622b32-3590-83e8-aeb8-142543422533) (source attachment: “Let’s stick with Black Lacquer”)
- [RealiTea route](./route.tsx)
- [RealiTea styles](./realitea.css)
- [Ponti Studios Design System](../../../../../packages/ui/design/SYSTEM.md)
- [Ponti Studios design philosophy](../../../../../packages/ui/design/philosophy.md)
- [Accessibility foundation](../../../../../packages/ui/design/foundations/accessibility.md)
- [Motion foundation](../../../../../packages/ui/design/foundations/motion.md)
