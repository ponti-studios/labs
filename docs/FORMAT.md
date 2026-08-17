---
title: Documentation Format
summary: The frontmatter schema and voice rules every doc in docs/* follows.
type: guide
status: active
owner: charlesponti
tags: [meta, docs]
related: []
updated: 2026-08-16
---

# Documentation Format

This file is the format. If a doc in `docs/*` doesn't match it, that's a bug in the doc.

## Frontmatter

Every doc opens with this block. No optional filler fields — if a field would
always be `null` for this repo, it doesn't belong in the schema.

```yaml
---
title: <short noun phrase, no "RealiTea" prefix redundancy unless disambiguating>
summary: <one sentence, what the doc is for, not what it contains>
type: architecture | reference | guide | proposal
status: active | draft | proposed
owner: <github username>
tags: [<lowercase, kebab-case>]
related: [<relative paths to other docs/*.md files>]
updated: <YYYY-MM-DD, bump on every substantive edit>
---
```

**`type`** decides the shape of the body:

- **architecture** — how a system is built and why it's split that way. Layers/components → API surface → operational surface → read next.
- **reference** — dense facts about one mechanism (a pipeline, a config surface). No narrative, no "we decided" — just what's true today and where to look in code.
- **guide** — how to run a command or workflow. Lead with the command.
- **proposal** — not built yet, or partially built. Problem → recommended shape → open questions. `status: proposed` until it ships, then it either graduates to `reference`/`architecture` or gets deleted.

**`status`**: `active` (true today, keep in sync with code), `draft` (being written, may be wrong), `proposed` (design for future work, nothing to verify against yet).

**`updated`** exists because stale docs are worse than no docs — a wrong claim about which script runs a cron job costs more than the doc's absence. Anyone editing a doc bumps this date. A doc with `status: active` and an `updated` date older than the code it describes is a signal to re-verify, not to trust.

## Voice

- Say the fact first, then the reason, if the reason is non-obvious. Don't warm up.
- Short paragraphs. 2–4 sentences. One idea each.
- Active voice, present tense for things that are true now.
- No hedging words ("basically", "essentially", "in general") and no throat-clearing ("This document describes...", "It's worth noting that...").
- Code identifiers, file paths, and commands in backticks. Cite the file when a claim is checkable in code — that's what keeps a doc from rotting invisibly.
- Cut anything that explains what the code already makes obvious. Explain the *why*, the tradeoff, the thing a reader can't get from `git blame`.
- No case-study narration, no "the hardest fixes were..." retrospectives. That's for a portfolio site, not `docs/*`. A doc here is either a map of the system as it stands or a proposal for the next change to it — never a story about how it got here.

## Lifecycle

A doc is deleted, not archived, once it stops being true and nothing in the
current system depends on knowing the history. Git history is the archive.
`docs/*` is a living map, not a log.
