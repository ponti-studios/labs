-- Drop dead columns that were always hardcoded constants and never read back
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN IF EXISTS "news_mode";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN IF EXISTS "source_kind";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN IF EXISTS "generation_batch_id";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN IF EXISTS "generation_status";--> statement-breakpoint

-- Drop old franchise-scoped indexes
DROP INDEX IF EXISTS "labs"."rhobh_daily_puzzles_franchise_status_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "labs"."rhobh_daily_puzzles_franchise_scheduled_date_idx";--> statement-breakpoint

-- Add status-only indexes (franchise-agnostic)
CREATE INDEX IF NOT EXISTS "rhobh_daily_puzzles_status_idx" ON "labs"."rhobh_daily_puzzles" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rhobh_daily_puzzles_scheduled_date_idx" ON "labs"."rhobh_daily_puzzles" USING btree ("scheduled_for_date_key");--> statement-breakpoint

-- Add data-integrity constraints
ALTER TABLE "labs"."rhobh_daily_puzzles" ADD CONSTRAINT "status_must_be_valid" CHECK (status IN ('scheduled', 'published', 'consumed'));--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" ADD CONSTRAINT "normalized_answer_length" CHECK (length(normalized_answer) = 5);--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" ADD CONSTRAINT "window_order" CHECK (publish_at < expire_at);
