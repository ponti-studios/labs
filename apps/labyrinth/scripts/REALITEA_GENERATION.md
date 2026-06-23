# RealiTea Puzzle Generation Workflow

Generate daily Bravo reality TV news puzzles for the RealiTea game.

## Quick Start

### Generate for Today (and Make It Live)
```bash
pnpm realitea:gen-today
```
Generates a puzzle for today and immediately publishes it so it's live in the game.

### Generate for Specific Date
```bash
pnpm realitea:gen --date-key=2026-06-25
```
Generates and schedules a puzzle for 2026-06-25. It will be promoted automatically when that date arrives.

### Generate Date Range
```bash
pnpm realitea:gen --from=2026-06-25 --to=2026-07-02
```
Generates puzzles for a continuous range of dates.

### Generate Next N Days
```bash
pnpm realitea:gen --days-ahead=7
```
Generates puzzles for the next 7 days (starting from today).

### Reconcile Full Inventory
```bash
pnpm realitea:reconcile
```
Runs the full reconciliation: promotes current day's puzzle, checks scheduled inventory, and fills gaps with new puzzles. Maintains a rolling 7-day inventory.

## Advanced Options

### Dry-Run (Validate Without Inserting)
```bash
pnpm realitea:gen --date-key=2026-06-25 --dry-run
```
Generates a candidate and validates it against rules, but doesn't insert into the database. Useful for testing the LLM output.

### Publish Mode
```bash
pnpm realitea:gen --from=2026-06-23 --to=2026-06-25 --publish
```
Generates puzzles and immediately publishes them (sets them as active for their target dates). **Warning**: This changes `dateUtc`, `publishAt`, and `expireAt` fields. Only use for testing or explicit date targeting.

## Environment Setup

### Local Development

1. **Create `.env.local`** (or use existing `.env`):
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/labyrinth"
OPENROUTER_API_KEY="sk-..."  # Get from https://openrouter.ai/keys
```

2. **Set environment variables before running**:
```bash
set -a && source .env && set +a && pnpm realitea:gen --date-key=2026-06-25
```

Or **persist them**:
```bash
export DATABASE_URL="postgresql://..."
export OPENROUTER_API_KEY="sk-..."
pnpm realitea:gen --date-key=2026-06-25
```

### GitHub Actions (CI/CD)

The scheduled workflow (`.github/workflows/cron-realitea-generate.yml`) runs daily to:
1. Promote today's scheduled puzzle to published
2. Generate puzzles for the next 7 days (fills inventory gaps)
3. Keeps a rolling 7-day buffer of scheduled puzzles

Secrets configured in GitHub:
- `DATABASE_URL` → Production database connection
- `OPENROUTER_API_KEY` → OpenRouter API key

## Workflow Modes

### Mode 1: Local Testing
```bash
# Generate today's puzzle and see it immediately in the game
pnpm realitea:gen-today
```
Then reload http://localhost:3001/games/realitea to play.

### Mode 2: Batch Scheduling (Production)
```bash
# Generate 7 days of inventory without promoting
pnpm realitea:gen --days-ahead=7
```
Puzzles stay scheduled until their dates arrive, when they're auto-promoted by the game loader.

### Mode 3: Inventory Management
```bash
# Runs daily via cron
pnpm realitea:reconcile
```
Maintains healthy inventory: promotes today's puzzle, fills gaps for the next 7 days.

## Output Examples

### Successful generation:
```
📅 Generating puzzles for 1 day(s)

✓ 2026-06-22: generated and published (CRASH)

📊 Summary: 1/1 succeeded
```

### Batch generation:
```
📅 Generating puzzles for 7 day(s)

✓ 2026-06-25: scheduled (VILLA)
✓ 2026-06-26: scheduled (DRAMA)
✓ 2026-06-27: scheduled (ASPEN)
✓ 2026-06-28: scheduled (TRUST)
✓ 2026-06-29: scheduled (PAUSE)
❌ 2026-06-30: generation failed after all attempts
✓ 2026-07-01: scheduled (HOTEL)

📊 Summary: 6/7 succeeded
```

## Troubleshooting

**"Missing required environment variables"**
- Ensure `DATABASE_URL` and `OPENROUTER_API_KEY` are set
- Check `.env` file or export them in your shell

**"Invalid date key"**
- Dates must be in `YYYY-MM-DD` format (e.g., `2026-06-25`)
- Use `--date-key`, `--from`, or `--to` with this format

**"Generation failed after all attempts"**
- The LLM attempted to generate 3 times and rejected all candidates
- Common reasons: no valid bravotv.com sources found, all candidates fail validation
- Try again later when there's more Bravo news available

**Puzzle exists, skipping**
- A puzzle is already scheduled for that date
- To regenerate, delete from the database first:
  ```sql
  DELETE FROM rhobh_daily_puzzles 
  WHERE scheduled_for_date_key = '2026-06-25' 
  AND status = 'scheduled';
  ```

## Database Schema

```
rhobh_daily_puzzles {
  id: number
  answer: string (5 letters)
  answer_type: 'moment' | 'object' | 'phrase' | 'place' | 'storyline'
  clue: string (indirect, evocative)
  detail: string (rich narrative, shown after game ends)
  
  franchise: 'bravo'
  status: 'scheduled' | 'published' | 'consumed'
  
  scheduled_for_date_key: string (YYYY-MM-DD) - intended play date
  date_utc: string (YYYY-MM-DD) - actual publish date
  publish_at: timestamp - when puzzle becomes visible
  expiration: timestamp - when puzzle expires
  
  source_urls: string[] - bravotv.com article URLs
  source_summary: string[] - article summaries (used as detail)
  source_titles: string[] - article titles
  source_published_at: string[] - publication dates
  
  created_at: timestamp
  updated_at: timestamp
}
```

## LLM Model Configuration

Currently using: `google/gemini-3.1-flash-lite` (via OpenRouter)

To change:
1. Edit `apps/labyrinth/app/lib/server/env.ts`
2. Change `openRouterModel` default
3. Or set `OPENROUTER_MODEL` environment variable

Models tested:
- ✅ `google/gemini-3.1-flash-lite` — reliable, handles markdown JSON wrapper
- ❌ `deepseek/deepseek-v4-flash` — hangs on API calls
- ❌ `qwen/qwen3.7-plus` — slow

## See Also

- [RealiTea Game Guide](../app/lib/realitea-daily-puzzle.ts) — Game rules and validation
- [System Prompt](../app/lib/prompts/bravo-generation-system.md) — LLM instructions
