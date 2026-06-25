-- Drop the old scheduled_for_date_key index
DROP INDEX IF EXISTS "labs"."rhobh_daily_puzzles_scheduled_date_idx";--> statement-breakpoint

-- Drop columns that are no longer needed
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN IF EXISTS "role";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN IF EXISTS "scheduled_for_date_key";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN IF EXISTS "source_summary";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN IF EXISTS "validation_status";--> statement-breakpoint

-- Create the new sources column with default empty array
ALTER TABLE "labs"."rhobh_daily_puzzles" ADD COLUMN "sources" jsonb NOT NULL DEFAULT '[]'::jsonb;--> statement-breakpoint

-- Migrate data from old parallel arrays into the new sources JSONB column
UPDATE "labs"."rhobh_daily_puzzles"
SET "sources" = (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'url', u.url,
        'title', COALESCE(t.title, ''),
        'publishedAt', COALESCE(p.published_at, '')
      )
      ORDER BY u.idx
    ),
    '[]'::json
  )
  FROM jsonb_array_elements_text("source_urls") WITH ORDINALITY AS u(url, idx)
  LEFT JOIN jsonb_array_elements_text("source_titles") WITH ORDINALITY AS t(title, idx)
    ON u.idx = t.idx
  LEFT JOIN jsonb_array_elements_text("source_published_at") WITH ORDINALITY AS p(published_at, idx)
    ON u.idx = p.idx
  WHERE "rhobh_daily_puzzles"."id" IS NOT NULL
);--> statement-breakpoint

-- Drop the old source columns
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN IF EXISTS "source_urls";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN IF EXISTS "source_titles";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN IF EXISTS "source_published_at";
