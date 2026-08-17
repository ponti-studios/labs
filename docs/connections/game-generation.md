---
title: Game Generation
summary: How category groups get assembled into a daily puzzle without collisions, and the generate-then-validate architecture for producing the groups themselves.
type: proposal
status: proposed
owner: charlesponti
tags: [architecture, ai, game-design, backend]
related: [./__index.md, ./api-design.md, ./word-sourcing.md]
updated: 2026-08-17
---

# Connections Game Generation

Generation here is two separable problems: assembling a *daily puzzle* out of existing content (solved, prototyped, tested), and producing the *content* those puzzles draw from (design settled, not yet built).

## Problem 1: daily assembly — solved

Prototyped in `scripts/connections/` (merged in [PR #236](https://github.com/ponti-studios/labs/pull/236)), pure JS/TS, no database.

**Model:** a category group (4 words, a label, a difficulty tier, and `riskWords` — words not in the group that a solver could plausibly mistake for members) is generated independently of any specific day. A daily puzzle is one group picked per difficulty tier (yellow/green/blue/purple), assembled at serve time, such that:

- none of the 16 words repeat across the 4 chosen groups,
- no word in one group is a risk word of another chosen group,
- no group was used within a reuse cooldown window.

**Picker:** randomized backtracking search over shuffled per-tier candidate lists (`scripts/connections/picker.ts`). Collision-free by construction, not by post-hoc filtering.

**Bank sizing math:** with 4 groups used per day, a clean non-repeating rotation needs `groups per day × cooldown days` = `4 × 180 = 720` groups as the floor — one full pass through the bank *is* the cooldown period. Measured via simulation (`scripts/connections/simulate.ts`) at that exact floor: zero cooldown violations and zero failures across two full simulated years. Below that floor, the failure mode is running out of eligible groups for a tier, not backtracking cost — performance was never the bottleneck; at realistic scale it's ~4 attempts and <1ms per pick.

This part of the system doesn't change based on where the groups came from. It consumes `CategoryGroup[]`, full stop.

## Problem 2: content generation — design settled, build pending

### The tag model

A word's identity, for this purpose, isn't "one dictionary entry" — it's a set of tags from however many sources apply:

- WordNet senses, each carrying a `lexName` (one of ~45 fixed semantic categories — see [word-sourcing.md](./word-sourcing.md)),
- curated-list membership (`js-framework`, `http-method`, `git-command`, etc.).

A word's full profile is the union. This one abstraction is what makes "words belong to multiple groups" tractable without building two parallel systems: enumerable categories are just "words sharing a curated-list tag," wordplay categories are "words with 2+ WordNet tags in different buckets," and the best category type — a proper noun that's also an ordinary English word with an unrelated meaning (`Rust`, `Go`, `Swift`, `Django`, `Vue`, `Svelte`) — falls out automatically as "words with a curated-list tag *and* a WordNet tag," no separate mechanism required.

### Architectures considered for producing groups

Six patterns, differing in where the LLM sits relative to the deterministic (WordNet/tag) layer:

1. **LLM as last-mile curator** — deterministic clustering generates raw candidates, LLM picks the best 4 from each and writes the label. Cheap, bounded, but capped by what clustering surfaces.
2. **LLM as generator, dictionary as verifier** — What's generate-then-validate loop, inverted onto this problem. LLM proposes groups directly; the picker's collision/riskWord logic (plus WordNet ground-truth checks) validates before anything is trusted. The only pattern that covers both wordplay *and* enumerable categories with one mechanism.
3. **Hybrid** — cheap bulk LLM brainstorm of raw ideas, each wordplay claim checked against WordNet ground truth before being trusted, then an LLM pass for label/riskWords polish.
4. **Embeddings instead of `lexName` clustering** — replaces the coarse 45-bucket taxonomy with gloss-embedding similarity clustering, raising the quality ceiling of the wordplay side specifically. Doesn't touch enumerable categories at all.
5. **LLM as an offline batch curation job** — for expanding curated enumerable lists specifically; human-approved once, reused indefinitely under the cooldown window, not a per-puzzle runtime path.
6. **LLM as adversarial solver (QA gate)** — orthogonal to all of the above. Before publishing a candidate puzzle, hand a second LLM the 16 shuffled words cold and see if it solves it the intended way. If it finds a *different* valid 4-group split, that's an unintended overlap the generator missed — reject and regenerate.

### What the ungrounded example puzzle changes about this

A test prompt to a general-purpose LLM ("come up with a Connections game") produced a coherent, collision-free puzzle — `MAP` for "Things With Keys" is real wordplay — with no access to WordNet, jargon-file, or any curated list. That's a concrete signal that pattern **#2** should be the primary path, not a fallback to pattern **#1**: the model already carries most of the associative/polysemy knowledge the clustering pipeline was trying to mine out of WordNet, so WordNet's job shifts from *primary generator* to *grounding layer* — confirm the LLM's claimed double-meaning is real, confirm no accidental overlap, don't take either on faith.

This doesn't reduce the importance of validation; if anything it raises it. One good example is a capability signal, not a reliability track record, and the same model that produces a clean puzzle on one call is just as capable of confidently inventing a "double meaning" that doesn't hold up, or missing its own accidental overlap the way any generator can. That's precisely the discipline What's architecture already encodes (model generates, server never trusts it blind) and precisely why pattern **#6** — an independent adversarial solver — earns its place as a standing QA gate regardless of which generator produced the candidate: the failure mode it catches (an overlap the generator didn't notice about its own output) is structurally not something the generator can be trusted to catch about itself.

**Recommended synthesis:** #2 as the primary generation path (reusing What's proven generate-validate-retry loop and the picker's already-built collision validator), #4 to raise the ceiling on the deterministic grounding layer specifically, #6 as a universal pre-publish QA gate. #1 and #5 are subsumed by #2 once it exists.

## Read next

- [Back to the overview](./__index.md)
- [API design](./api-design.md)
- [Word sourcing](./word-sourcing.md)
