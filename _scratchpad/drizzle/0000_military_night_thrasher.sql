CREATE TABLE "tfl_cameras" (
	"id" serial PRIMARY KEY NOT NULL,
	"tfl_id" text NOT NULL,
	"common_name" text NOT NULL,
	"available" boolean DEFAULT true,
	"image_url" text,
	"video_url" text,
	"view" text,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tfl_cameras_tfl_id_unique" UNIQUE("tfl_id")
);
