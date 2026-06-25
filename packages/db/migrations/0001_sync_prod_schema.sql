ALTER TABLE "labs"."rhobh_daily_puzzles" DROP CONSTRAINT "status_must_be_valid";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP CONSTRAINT "window_order";--> statement-breakpoint
DROP INDEX "labs"."rhobh_daily_puzzles_status_idx";--> statement-breakpoint
DROP INDEX "labs"."rhobh_daily_puzzles_scheduled_date_idx";--> statement-breakpoint
DROP INDEX "labs"."rhobh_daily_puzzles_active_schedule_idx";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" ALTER COLUMN "sources" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN "franchise";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN "source_urls";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN "source_titles";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN "source_published_at";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN "source_summary";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN "validation_status";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN "scheduled_for_date_key";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN "publish_at";--> statement-breakpoint
ALTER TABLE "labs"."rhobh_daily_puzzles" DROP COLUMN "expire_at";