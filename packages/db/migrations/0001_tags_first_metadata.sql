CREATE TABLE "labs"."tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"color" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_normalized_name_idx" ON "labs"."tags" USING btree ("user_id","normalized_name");
--> statement-breakpoint
CREATE TABLE "labs"."todo_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"todo_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"created_at" timestamp,
	CONSTRAINT "todo_tags_todo_id_todos_id_fk" FOREIGN KEY ("todo_id") REFERENCES "labs"."todos"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "todo_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "labs"."tags"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "todo_tags_todo_id_tag_id_idx" ON "labs"."todo_tags" USING btree ("todo_id","tag_id");
--> statement-breakpoint
ALTER TABLE "labs"."todos" DROP CONSTRAINT IF EXISTS "todos_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "labs"."todos" DROP COLUMN IF EXISTS "project_id";
--> statement-breakpoint
DROP TABLE IF EXISTS "labs"."projects";
