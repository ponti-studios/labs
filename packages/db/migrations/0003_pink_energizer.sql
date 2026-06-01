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
ALTER TABLE "labs"."covid_data" ALTER COLUMN "total_cases" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_cases" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_cases_smoothed" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "total_deaths" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_deaths" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_deaths_smoothed" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "total_cases_per_million" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_cases_per_million" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_cases_smoothed_per_million" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "total_deaths_per_million" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_deaths_per_million" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_deaths_smoothed_per_million" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "icu_patients" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "icu_patients_per_million" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "hosp_patients" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "hosp_patients_per_million" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "weekly_icu_admissions" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "weekly_icu_admissions_per_million" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "weekly_hosp_admissions" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "weekly_hosp_admissions_per_million" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "total_tests" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_tests" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_tests_smoothed" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "total_vaccinations" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "people_vaccinated" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "people_fully_vaccinated" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "total_boosters" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_vaccinations" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_vaccinations_smoothed" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_vaccinations_smoothed_per_million" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "new_people_vaccinated_smoothed" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "labs"."covid_data" ALTER COLUMN "population" SET DATA TYPE bigint;--> statement-breakpoint
CREATE UNIQUE INDEX "rhobh_daily_puzzles_franchise_date_idx" ON "labs"."rhobh_daily_puzzles" USING btree ("franchise","date_utc");