CREATE TABLE "labs"."rhobh_daily_puzzles" (
	"id" serial PRIMARY KEY NOT NULL,
	"date_utc" text NOT NULL,
	"franchise" text NOT NULL,
	"answer" text NOT NULL,
	"answer_type" text NOT NULL,
	"normalized_answer" text NOT NULL,
	"clue" text NOT NULL,
	"detail" text NOT NULL,
	"role" text NOT NULL,
	"news_mode" text NOT NULL,
	"source_urls" text NOT NULL,
	"source_titles" text NOT NULL,
	"source_published_at" text NOT NULL,
	"source_summary" text NOT NULL,
	"generation_status" text NOT NULL,
	"validation_status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "rhobh_daily_puzzles_franchise_date_idx" ON "labs"."rhobh_daily_puzzles" USING btree ("franchise","date_utc");
