---
title: Connections Word Sourcing
project: connections
type: spec
status: active
client: null
industry: null
owner: charlesponti
tags:
  - data
  - nlp
  - game-design
  - ai
related:
  - ./__index.md
  - ./game-generation.md
summary: Where category-group words and their cross-domain overlaps come from — a curated software-industry seed pool, WordNet for grounding, and an LLM for generation, not the other way around.
---

# Connections Word Sourcing

## The model: words, not puzzles, are the content unit

A single game of Connections has 4 groups, but the groups aren't related to each other — they're independent. That means the unit of content isn't "a puzzle," it's a **category group** (4 words + a label + a difficulty tier + risk words). Puzzles are assembled at serve time by picking 4 off-cooldown groups (see [game-generation.md](./game-generation.md)). This doc is about where the groups themselves — and the words in them — come from.

## Environment constraint that shaped this

General web egress (Wikipedia, Datamuse, kaikki.org's Wiktionary dumps) is blocked by this sandbox's network policy. The npm registry is not — it's on the explicit allowlist alongside PyPI, crates.io, and a handful of others. That constraint, not preference, is why the sourcing below leans on npm-installable lexical data rather than live API calls or scraped dictionary dumps. If a future environment has broader egress, Wiktionary-via-kaikki.org would be a strictly richer source (explicit domain-labeled senses per word) worth revisiting.

## Sources evaluated

### `jargon-file` (npm)

The actual Jargon File — hacker-culture terminology — shipped as JSON. 2,307 entries total; **1,256 single real words** after filtering out acronyms and multi-word phrases. This is the seed vocabulary for wordplay mining: real words the software industry actually uses, not a synthetic list.

### `wordpos` (npm, wraps WordNet)

For any word, returns every dictionary sense, each tagged with a `lexName` — one of WordNet's ~45 fixed lexicographer categories (`noun.food`, `noun.person`, `noun.communication`, `verb.contact`, etc.), plus hypernym pointers for finer-grained concept relationships. This is a real, pre-built semantic taxonomy — not something we hand-authored — and it's what makes cross-domain overlap detection a data query instead of a human noticing "oh, cracker is funny" by accident.

Measured against the jargon-file pool: **359 of 1,256 words touch 2+ distinct `lexName` buckets** (a loose proxy for "has a tech sense and an unrelated sense"). Clustering those by shared bucket and taking `floor(bucket_size / 4)` gives an upper bound of **386 disjoint candidate groups** — but `lexName` is coarse (`noun.artifact` covers "any human-made object," which isn't a nameable category on its own), so real usable yield after quality filtering is a fraction of that, likely in the dozens-to-~150 range. See [game-generation.md](./game-generation.md) for how that yield compares against the bank size the picker actually needs.

### `@cspell/dict-software-terms` (npm)

A spellcheck dictionary with sub-lists for tools (`software-tools.txt`, 592 entries), networking terms, web services, and computing acronyms. Useful as raw material for **enumerable categories** (cloud providers, protocols, tool names) but it's a flat, uncategorized wordlist — "ArgoCD" and "Alacritty" sit next to each other with no signal grouping them into a clean theme like "Kubernetes Tools." Bootstrapping clean named categories out of this would require real re-curation work, not just filtering.

### Hand-curated enumerable lists

For category types WordNet fundamentally can't produce — "JS Frameworks," "HTTP Methods," "Git Commands" — because these are proper-noun set membership, not polysemy. WordNet has no entry for "React" the framework. These need either hand-authoring (fast, high-quality, what `fixtures.ts` already does for the picker prototype) or LLM-assisted drafting reviewed by a human once, since these lists get reused under the cooldown window rather than regenerated per puzzle.

### The hybrid case — the best category type this game has access to

Proper nouns from the enumerable lists that *also* happen to be ordinary WordNet words with an unrelated sense: `Rust`/rust (oxidation), `Go`/go, `Swift`/swift (bird), `Django`/Django (person/film), `Angular`/angular (adjective), `Vue`/view (homophone), `Svelte`/svelte (adjective, "slender"). This costs nothing extra to detect once a word's profile is modeled as a union of tags from both sources (WordNet senses + curated-list membership) — see the tag-model discussion in [game-generation.md](./game-generation.md).

## The LLM reframes this doc's job

A test prompt ("come up with a Connections game") produced a genuinely well-formed puzzle — including `MAP` for "Things With Keys" — with zero access to any of the above. That's a strong signal the model already has this associative/polysemy knowledge from training, and it shifts what this pipeline is actually for:

- **Before this signal:** WordNet clustering was the primary *generator*; the LLM's role was mostly polish (pick the best 4 from a cluster, write a label).
- **After this signal:** the LLM is the primary *generator* of both words and groupings — including the enumerable categories WordNet can't touch at all. WordNet, jargon-file, and the curated lists become the **grounding/verification layer**: is this claimed double-meaning real, per a source of truth, not per the model's say-so; is this claimed group free of the collisions our picker already knows how to detect.

That mirrors RealiTea's existing discipline exactly — a model generates, the server never trusts it blind, ground truth validates before anything publishes. One good example doesn't establish a track record; it establishes that the generation side is worth building, with validation held to the same bar RealiTea already proved out.

## Read next

- [Back to the overview](./__index.md)
- [API design](./api-design.md)
- [Game generation](./game-generation.md)
