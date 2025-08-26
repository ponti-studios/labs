import { relations } from "drizzle-orm";
import {
	json,
	pgTable,
	real,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// Auth users table (reference for foreign keys)
// We don't define it here as it's managed by Supabase Auth,
// but we can reference it in our relations or foreign keys if needed.
// For simplicity in schema definition, direct foreign key constraints to auth.users
// might require fully qualifying the table name if Drizzle doesn't handle 'auth.users' schema prefix well by default.
// Often, you might just store user_id as UUID and rely on application-level checks or Supabase RLS.
// However, for referential integrity, we can try to define it.

// If you have a separate schema for auth, you might need to specify it.
// For Supabase, users are typically in the 'auth' schema.
// As Drizzle Kit might have issues with cross-schema references without specific setup,
// we will define user_id as a simple uuid column for now and rely on RLS for security.
// If direct FK to auth.users is desired and causes issues, it might need advanced Drizzle config or manual SQL for the FK.

export const trackers = pgTable("trackers", {
	id: uuid("id").primaryKey().defaultRandom(), // Uses gen_random_uuid() by default
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	name: text("name").notNull(),
	hp: text("hp"),
	cardType: text("card_type"),
	description: text("description"),
	attacks: json("attacks").$type<{ name: string; damage: number }[]>(),
	strengths: json("strengths").$type<string[]>(),
	flaws: json("flaws").$type<string[]>(),
	commitmentLevel: text("commitment_level"),
	colorTheme: text("color_theme"),
	photoUrl: text("photo_url"),
	imageScale: real("image_scale"),
	imagePosition: json("image_position").$type<{ x: number; y: number }>(),
	userId: uuid("user_id").notNull(),
});
export type Tracker = typeof trackers.$inferSelect;
export type TrackerInsert = typeof trackers.$inferInsert;

export const trackersRelations = relations(trackers, ({ many, one }) => ({
	votes: many(votes),
	// If you want to create a relation to a user table (e.g., if you replicate user data or have a profiles table):
	// user: one(users, { fields: [trackers.userId], references: [users.id] })
}));

export const votes = pgTable("votes", {
	id: uuid("id").primaryKey().defaultRandom(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	trackerId: uuid("tracker_id")
		.notNull()
		.references(() => trackers.id),
	userId: uuid("user_id"), // Nullable for anonymous votes, refers to auth.users.id
	fingerprint: text("fingerprint").notNull(),
	raterName: text("rater_name").notNull(), // Added rater's name
	value: text("value", { enum: ["stay", "dump"] }).notNull(), // Updated enum
	comment: text("comment"), // Added comment
});
export type Vote = typeof votes.$inferSelect;
export type VoteInsert = typeof votes.$inferInsert;

export const votesRelations = relations(votes, ({ one }) => ({
	// tracker: one(trackers, {
	// 	fields: [votes.trackerId],
	// 	references: [trackers.id],
	// }),
	// If you want to create a relation to a user table:
	// user: one(users, { fields: [votes.userId], references: [users.id] })
}));

// Note on auth.users:
// Drizzle ORM primarily focuses on the tables you define in your schema.ts.
// For tables in other schemas like Supabase's built-in 'auth.users',
// direct foreign key constraints in `pgTable` (e.g., `references(() => authUsers.id)`) can be tricky
// if `authUsers` isn't also defined in a way Drizzle understands or if schema prefixes are not handled automatically.
// The `userId` fields are defined as `uuid`. Supabase RLS policies will be crucial for ensuring that
// these `userId` fields correctly correspond to `auth.uid()`.
// If you need to join with `auth.users` in Drizzle queries, you might need to use raw SQL
// or explore Drizzle's capabilities for handling existing tables/schemas not directly in schema.ts.
