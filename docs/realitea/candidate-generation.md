### **1. Trigger**

- **Frequency:** Once a day.
- **Runner:** GitHub Actions (`cron-realitea-generate.yml`, cron `0 17 * * *` — 9am Pacific / 17:00 UTC, chosen to stay DST-safe rather than targeting midnight UTC) runs `pnpm realitea:generate`, which fills gaps in a forward inventory range (default 7 days) rather than generating a single day's puzzle directly. A second workflow, `realitea-regenerate.yml`, is manual (`workflow_dispatch`) for on-demand regeneration.

### **2. Ingestion**

- **Action:** The script pulls the latest articles from the RSS feed source (`https://realityblurb.com/feed`).
- **Caching:** The data is cached or prepared as the context payload for the LLM prompt.

### **3. Generation & Validation Loop (Max 3 Attempts)**

The worker enters a loop to find a usable candidate. It has a strict budget of **3 total attempts** (up to 15 candidates total, though a batch may return as few as 3 — see below).

- **Step A: LLM Request**

  - The worker sends the feed data to the **OpenRouter API** (via TanStack AI).
  - The LLM generates a batch of **3 to 5 candidates** per request (schema-enforced `min(3).max(5)`), not a fixed 5.

- **Step B: Sequential Validation**

  - The worker processes the candidates in the batch one by one, in order.
  - **If a candidate is VALID:**

    - It immediately **wins** — the first valid candidate found stops evaluation.
    - The winning candidate is written to the database table **`labs.rhobh_daily_puzzles`** (Drizzle export `rhobhDailyPuzzles`).
    - All remaining candidates in that batch are **discarded**, and generation exits successfully.

  - **If a candidate is INVALID:**

    - The worker discards it and moves to the next candidate in the batch.

### **4. Retry Logic**

- If **every candidate** in the current batch fails validation:

  - **Check Attempt Count:** If the current attempt is less than 3, the worker increments the attempt counter (e.g., moving from Attempt 1/3 to 2/3) and backs off exponentially (`2^attempt` seconds).
  - **Action:** The worker loops back to **Step A**, sending a fresh request to OpenRouter to generate a new batch of candidates.

### **5. Termination / Failure**

- If the loop reaches **Attempt 3/3** and every candidate in that final batch is also invalid, generation logs `event: "[GENERATION_EXHAUSTED]"` with message `"puzzle generation failed after all attempts"` and returns without publishing anything for that slot. There is no curated-archive fallback at generation time — per-attempt failures separately log `[GENERATION_RETRY]` with `"generation attempt yielded no valid candidate"`.
