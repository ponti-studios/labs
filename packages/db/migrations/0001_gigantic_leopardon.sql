DROP INDEX "labs"."rhobh_daily_puzzles_franchise_date_idx";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" ALTER COLUMN "date_utc" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" ADD COLUMN "status" text NOT NULL DEFAULT 'published';--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" ADD COLUMN "scheduled_for_date_key" text;--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" ADD COLUMN "source_kind" text NOT NULL DEFAULT 'current';--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" ADD COLUMN "generation_batch_id" text;--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" ADD COLUMN "publish_at" timestamp;--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" ADD COLUMN "expire_at" timestamp;--> statement-breakpoint
UPDATE "labs"."rhobh_daily_puzzles"
SET
  "scheduled_for_date_key" = CASE
    WHEN "date_utc" IS NULL THEN NULL
    ELSE to_char("date_utc", 'YYYY-MM-DD')
  END,
  "source_kind" = CASE
    WHEN "news_mode" = 'archive' THEN 'evergreen'
    ELSE 'current'
  END,
  "generation_batch_id" = COALESCE("generation_batch_id", 'legacy-import'),
  "publish_at" = COALESCE("publish_at", "created_at"),
  "expire_at" = COALESCE("expire_at", "created_at" + interval '1 day');--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" ALTER COLUMN "source_kind" DROP DEFAULT;--> statement-breakpoint
CREATE INDEX "rhobh_daily_puzzles_franchise_status_idx" ON "labs"."rhobh_daily_puzzles" USING btree ("franchise","status");--> statement-breakpoint
CREATE INDEX "rhobh_daily_puzzles_franchise_scheduled_date_idx" ON "labs"."rhobh_daily_puzzles" USING btree ("franchise","scheduled_for_date_key");--> statement-breakpoint
CREATE UNIQUE INDEX "rhobh_daily_puzzles_active_schedule_idx" ON "labs"."rhobh_daily_puzzles" USING btree ("franchise","scheduled_for_date_key") WHERE "status" IN ('scheduled', 'published') AND "scheduled_for_date_key" IS NOT NULL;
