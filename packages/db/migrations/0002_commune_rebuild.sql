-- Commune rebuild: replace Pokémon card schema with case-file schema
-- Safe to truncate — dev database, no real users

TRUNCATE TABLE "labs"."relationship_verdicts" CASCADE;--> statement-breakpoint
TRUNCATE TABLE "labs"."relationship_cases" CASCADE;--> statement-breakpoint

-- Drop old card fields from relationship_cases
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "hp";--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "card_type";--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "attacks";--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "strengths";--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "flaws";--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "commitment_level";--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "color_theme";--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "photo_url";--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "image_scale";--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "image_position";--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" DROP COLUMN "updated_at";--> statement-breakpoint

-- Add new case-file fields
ALTER TABLE "labs"."relationship_cases" ADD COLUMN "label" text;--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" ADD COLUMN "raw_situation" text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" ADD COLUMN "neutral_situation" text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" ADD COLUMN "question" text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" ADD COLUMN "quorum_size" integer NOT NULL DEFAULT 3;--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" ADD COLUMN "status" text NOT NULL DEFAULT 'open';--> statement-breakpoint

-- Remove defaults now that existing rows are handled
ALTER TABLE "labs"."relationship_cases" ALTER COLUMN "raw_situation" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" ALTER COLUMN "neutral_situation" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "labs"."relationship_cases" ALTER COLUMN "question" DROP DEFAULT;--> statement-breakpoint

-- Create case_updates table
CREATE TABLE "labs"."case_updates" (
  "id" text PRIMARY KEY NOT NULL,
  "case_id" text NOT NULL,
  "raw_content" text NOT NULL,
  "neutral_content" text NOT NULL,
  "round" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "case_updates_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "labs"."relationship_cases"("id") ON DELETE CASCADE
);--> statement-breakpoint
CREATE INDEX "case_updates_case_id_idx" ON "labs"."case_updates" ("case_id");--> statement-breakpoint

-- Alter relationship_verdicts
ALTER TABLE "labs"."relationship_verdicts" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "labs"."relationship_verdicts" ADD COLUMN "update_id" text REFERENCES "labs"."case_updates"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "labs"."relationship_verdicts" ADD COLUMN "update_round" integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE "labs"."relationship_verdicts" ALTER COLUMN "comment" SET NOT NULL;
