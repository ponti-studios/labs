# RealiTea: Candidate Generation Preview Mode

## Context

The existing `--dry-run` flag in `generate-realitea-scheduled-puzzle.ts` is misleading: it still calls `generateScheduledPuzzle()` which inserts a "scheduled" record into the database — it only skips the `publishPuzzle()` call. Developers have no way to test the full generation pipeline (RSS fetch → LLM → validation) without writing to the DB.

Additionally, `generateScheduledPuzzle()` only surfaces the final winning answer — all other candidates and their failure reasons are discarded. This makes prompt iteration and source tuning impossible.

The goal is a `realitea:preview` command that runs the pipeline end-to-end, requires only `OPENROUTER_API_KEY` (no `DATABASE_URL`), and prints every candidate with its validation breakdown.

---

## Plan

### 1. Add types to `app/lib/realitea.types.ts`

Append these interfaces at the bottom of the file:

```ts
export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export interface CandidatePreview {
  candidate: {
    answer: string;
    answerType: string;
    clue: string;
    detail: string;
    sourceUrls: string[];
    sourceSummary?: string[];
    sourceTitles?: string[];
    sourcePublishedAt?: string[];
  };
  validation: { normalizedAnswer: string; valid: boolean; reasons: string[] };
}

export interface GenerationPreviewResult {
  dateKey: string;
  feedUrl: string;
  feedItemCount: number;
  feedItems: FeedItem[];
  candidates: CandidatePreview[];
  selectedIndex: number | null;
  llmError: string | null;
}

export interface PreviewCandidatesOptions {
  feedUrl?: string;
  systemPrompt?: string;
  excludedAnswers?: string[];
}
```

`FeedItem` is currently a private type in `realitea-generation.ts` — move it here so the script can import it without coupling to generation internals.

---

### 2. Update `app/lib/realitea-generation.ts`

**a. Import `FeedItem` from types, remove the local `type FeedItem`.**

**b. Update `fetchFeedItems()` to accept an optional URL override:**

```ts
async function fetchFeedItems(feedUrl?: string): Promise<FeedItem[]>;
// use: feedUrl ?? REALITY_BLURB_FEED_URL
```

**c. Add a private `callGenerationApiForPreview()` function:**

Same message construction as `callGenerationApi()`, but:

- Accepts optional `systemPrompt` override (falls back to module-level `SYSTEM_PROMPT`)
- Always applies `replaceAll("{{ANSWER_LENGTH}}", ...)` to whatever prompt is used
- Returns `{ candidates: CandidatePreview[], llmError: string | null }` — all candidates with their validation results, no winner selection

Consider extracting a private `buildMessages(dateKey, excludedAnswers, feedItems, systemPrompt)` helper to avoid divergence between the two api callers.

**d. Export `previewCandidates(dateKey, options?)`:**

```ts
export async function previewCandidates(
  dateKey: string,
  options: PreviewCandidatesOptions = {},
): Promise<GenerationPreviewResult>;
```

Logic:

1. Resolve `feedUrl = options.feedUrl ?? REALITY_BLURB_FEED_URL`
2. Fetch feed items via `fetchFeedItems(feedUrl)` — catch errors, store `[]` + note in result
3. Call `callGenerationApiForPreview(dateKey, options.excludedAnswers ?? [], feedItems, options.systemPrompt)`
4. Find `selectedIndex` = first index where `candidates[i].validation.valid === true`, else `null`
5. Return full `GenerationPreviewResult`

**No DB imports touched** — `generateScheduledPuzzle` already owns all DB calls. `previewCandidates` lives alongside it with no DB dependency.

---

### 3. Create `scripts/realitea-preview.ts`

New script. Pattern mirrors `realitea-health-check.ts`:

- `import "dotenv/config"` at the top (so `.env` files work locally)
- Only requires `OPENROUTER_API_KEY` (no `DATABASE_URL`)
- No `finally { closeDb() }` — no DB connection is opened

**CLI flags:** `--date-key=YYYY-MM-DD`, `--feed-url=URL`, `--prompt-file=path`  
**Defaults:** today's date, default feed, default prompt

**Output format:**

```
RealiTea Preview — 2026-06-25
Feed: https://realityblurb.com/feed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FEED (12 items)
  1. "RHOBH Cast Drama Erupts at Finale Dinner" (2026-06-24)
  2. "Vanderpump Rules Star Announces Wedding"   (2026-06-23)
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CANDIDATES (4 from LLM)

[1]  CRASH  (storyline)  ✓ PASS  ← SELECTED
  Clue:   "When the dessert course ended in disaster..."
  Detail: "Sources say the reunion dinner took an..."
  Sources: https://realityblurb.com/2026/06/crash-dinner

[2]  DRAMA  (storyline)  ✗ FAIL
  Clue:   "Bravo's most-watched moment of the season"
  Reasons: answer is leaked in clue or detail

[3]  PAUSE  (phrase)  ✓ PASS
  Clue:   "Production confirmed a hiatus"
  Sources: https://realityblurb.com/2026/06/pause-news

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESULT
  Selected: CRASH (candidate #1)
  Valid: 2/4   LLM error: none
```

**When nothing passes validation:**

```
RESULT
  Selected: NONE — no candidate passed validation
  Valid: 0/4   LLM error: none
```

---

### 4. Add to `package.json` scripts

```json
"realitea:preview": "tsx --tsconfig tsconfig.json scripts/realitea-preview.ts"
```

**Typical invocations:**

```bash
pnpm realitea:preview                                    # today, default feed+prompt
pnpm realitea:preview --date-key=2026-07-04
pnpm realitea:preview --prompt-file=./app/lib/prompts/bravo-generation-system.md
pnpm realitea:preview --feed-url=https://example.com/rss
```

---

## Verification

```bash
# 1. Type-check passes
npx tsc --noEmit

# 2. Run with default options (only needs OPENROUTER_API_KEY)
export OPENROUTER_API_KEY=sk-...
pnpm realitea:preview --date-key=2026-06-25

# 3. Confirm no DB rows were created
# (no DATABASE_URL needed; script should complete without connecting)

# 4. Test prompt override
pnpm realitea:preview --prompt-file=./app/lib/prompts/bravo-generation-system.md

# 5. Test bad feed URL — should show feed error, not crash
pnpm realitea:preview --feed-url=https://invalid.example/feed
```
