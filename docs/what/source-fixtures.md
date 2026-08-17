---
title: Source Fixtures
summary: How to capture offline RSS/article snapshots for prompt testing without live feeds.
type: guide
status: active
owner: charlesponti
tags: [generation, testing, fixtures]
related: [./prompt-evaluation.md, ./candidate-generation.md]
updated: 2026-08-16
---

# Source Fixtures

Use the real RSS feeds to create reusable, offline prompt inputs:

```bash
pnpm what:capture-fixtures
```

The capture command stores bounded RSS metadata plus bounded readable article text in `app/lib/what/fixtures/sources/`. It does not write to the database. Refresh one source with:

```bash
pnpm what:capture-fixtures --feed=tmz --limit=50
```

Run the prompt benchmark against snapshots instead of live feeds:

```bash
pnpm what:prompt-test \
  --source-fixture=app/lib/what/fixtures/sources/tech-news.json \
  --source-fixture=app/lib/what/fixtures/sources/page-six.json
```

The article body is extracted from the linked page when available; RSS metadata remains the fallback for blocked or paywalled pages. Fixtures are bounded snapshots, not permanent full article archives. They are useful for testing source grounding, answer validity, leakage, prompt injection handling, and candidate ranking. Curated fixtures with `expectedAnswers` remain the correctness benchmark because real snapshots need editorial labeling before they can assert a specific answer.
