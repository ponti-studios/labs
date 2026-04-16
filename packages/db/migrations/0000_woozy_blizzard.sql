CREATE TABLE "disaster_events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"source_url" text,
	"category_id" text NOT NULL,
	"category_title" text NOT NULL,
	"occurred_at" text NOT NULL,
	"geometry_type" text NOT NULL,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"closed_at" text,
	"source" text,
	"timestamp" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trackers" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"hp" text,
	"card_type" text,
	"description" text,
	"attacks" text,
	"strengths" text,
	"flaws" text,
	"commitment_level" text,
	"color_theme" text,
	"photo_url" text,
	"image_scale" integer,
	"image_position" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tracker_id" text NOT NULL,
	"user_id" text,
	"fingerprint" text NOT NULL,
	"rater_name" text NOT NULL,
	"value" text NOT NULL,
	"comment" text
);
--> statement-breakpoint
CREATE TABLE "relationship_checkins" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"owner_user_id" text NOT NULL,
	"mood_score" integer NOT NULL,
	"clarity_score" integer NOT NULL,
	"trust_score" integer NOT NULL,
	"compatibility_score" integer NOT NULL,
	"energy_score" integer NOT NULL,
	"notes" text,
	"recorded_at" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_events" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"owner_user_id" text NOT NULL,
	"event_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"occurred_at" text NOT NULL,
	"sentiment" text NOT NULL,
	"intensity" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_flags" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"owner_user_id" text NOT NULL,
	"flag_type" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"source" text NOT NULL,
	"severity" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_friend_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"owner_user_id" text NOT NULL,
	"invite_token" text NOT NULL,
	"status" text NOT NULL,
	"expires_at" text,
	"share_summary" integer DEFAULT 0 NOT NULL,
	"share_timeline" integer DEFAULT 0 NOT NULL,
	"share_flags" integer DEFAULT 0 NOT NULL,
	"share_checkins" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_friend_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"invite_id" text NOT NULL,
	"person_id" text NOT NULL,
	"voter_name" text NOT NULL,
	"voter_contact_hint" text,
	"vote" text NOT NULL,
	"confidence_score" integer,
	"commentary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_metrics_daily" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"metric_date" text NOT NULL,
	"health_score" text NOT NULL,
	"friend_sentiment_score" text,
	"red_flag_count" integer DEFAULT 0 NOT NULL,
	"green_flag_count" integer DEFAULT 0 NOT NULL,
	"event_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"owner_user_id" text NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_people" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"status" text NOT NULL,
	"current_stage" text NOT NULL,
	"started_at" text,
	"ended_at" text,
	"headline" text,
	"profile_summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_stage_history" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"from_stage" text,
	"to_stage" text NOT NULL,
	"effective_at" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "covid_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"iso_code" text,
	"continent" text,
	"location" text,
	"date" text,
	"total_cases" integer,
	"new_cases" integer,
	"new_cases_smoothed" integer,
	"total_deaths" integer,
	"new_deaths" integer,
	"new_deaths_smoothed" integer,
	"total_cases_per_million" integer,
	"new_cases_per_million" integer,
	"new_cases_smoothed_per_million" integer,
	"total_deaths_per_million" integer,
	"new_deaths_per_million" integer,
	"new_deaths_smoothed_per_million" integer,
	"reproduction_rate" text,
	"icu_patients" integer,
	"icu_patients_per_million" integer,
	"hosp_patients" integer,
	"hosp_patients_per_million" integer,
	"weekly_icu_admissions" integer,
	"weekly_icu_admissions_per_million" integer,
	"weekly_hosp_admissions" integer,
	"weekly_hosp_admissions_per_million" integer,
	"total_tests" integer,
	"new_tests" integer,
	"total_tests_per_thousand" text,
	"new_tests_per_thousand" text,
	"new_tests_smoothed" integer,
	"new_tests_smoothed_per_thousand" text,
	"positive_rate" text,
	"tests_per_case" text,
	"tests_units" text,
	"total_vaccinations" integer,
	"people_vaccinated" integer,
	"people_fully_vaccinated" integer,
	"total_boosters" integer,
	"new_vaccinations" integer,
	"new_vaccinations_smoothed" integer,
	"total_vaccinations_per_hundred" text,
	"people_vaccinated_per_hundred" text,
	"people_fully_vaccinated_per_hundred" text,
	"total_boosters_per_hundred" text,
	"new_vaccinations_smoothed_per_million" integer,
	"new_people_vaccinated_smoothed" integer,
	"new_people_vaccinated_smoothed_per_hundred" text,
	"stringency_index" text,
	"population_density" text,
	"median_age" text,
	"aged_65_older" text,
	"aged_70_older" text,
	"gdp_per_capita" text,
	"extreme_poverty" text,
	"cardiovasc_death_rate" text,
	"diabetes_prevalence" text,
	"female_smokers" text,
	"male_smokers" text,
	"handwashing_facilities" text,
	"hospital_beds_per_thousand" text,
	"life_expectancy" text,
	"human_development_index" text,
	"population" integer,
	"excess_mortality_cumulative_absolute" text,
	"excess_mortality_cumulative" text,
	"excess_mortality" text,
	"excess_mortality_cumulative_per_million" text
);
--> statement-breakpoint
CREATE TABLE "embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"todo_id" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" text NOT NULL,
	"model" text NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tfl_cameras" (
	"id" serial PRIMARY KEY NOT NULL,
	"tfl_id" text NOT NULL,
	"common_name" text NOT NULL,
	"available" integer,
	"image_url" text,
	"video_url" text,
	"view" text,
	"lat" text NOT NULL,
	"lng" text NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"project_id" integer,
	"title" text NOT NULL,
	"start" text NOT NULL,
	"end" text NOT NULL,
	"completed" integer,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" text NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"daily_signs_enabled" integer DEFAULT 0 NOT NULL,
	"last_sign_sent" timestamp,
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;