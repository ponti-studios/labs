CREATE TABLE "dumphim_trackers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"hp" text,
	"card_type" text,
	"description" text,
	"attacks" json,
	"strengths" json,
	"flaws" json,
	"commitment_level" text,
	"color_theme" text,
	"photo_url" text,
	"image_scale" real,
	"image_position" json,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dumphim_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tracker_id" uuid NOT NULL,
	"user_id" uuid,
	"fingerprint" text NOT NULL,
	"rater_name" text NOT NULL,
	"value" text NOT NULL,
	"comment" text
);
--> statement-breakpoint
ALTER TABLE "dumphim_votes" ADD CONSTRAINT "dumphim_votes_tracker_id_dumphim_trackers_id_fk" FOREIGN KEY ("tracker_id") REFERENCES "public"."dumphim_trackers"("id") ON DELETE cascade ON UPDATE no action;