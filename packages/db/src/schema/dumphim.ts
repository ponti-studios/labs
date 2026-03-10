import { relations } from "drizzle-orm";
import { json, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Dumphim Schema - Relationship Health Tracker
 *
 * This schema was migrated from Supabase to PostgreSQL + Drizzle
 * Date: March 2026
 */

export const users = pgTable("dumphim_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
});

export const usersRelations = relations(users, ({ many }) => ({
  trackers: many(trackers),
}));

export const trackers = pgTable("dumphim_trackers", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
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

export const trackersRelations = relations(trackers, ({ many, one }) => ({
  votes: many(votes),
  user: one(users, {
    fields: [trackers.userId],
    references: [users.id],
  }),
}));

export const votes = pgTable("dumphim_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  trackerId: uuid("tracker_id")
    .notNull()
    .references(() => trackers.id, { onDelete: "cascade" }),
  userId: uuid("user_id"), // Nullable for anonymous votes
  fingerprint: text("fingerprint").notNull(),
  raterName: text("rater_name").notNull(),
  value: text("value", { enum: ["stay", "dump"] }).notNull(),
  comment: text("comment"),
});

export const votesRelations = relations(votes, ({ one }) => ({
  tracker: one(trackers, {
    fields: [votes.trackerId],
    references: [trackers.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type Tracker = typeof trackers.$inferSelect;
export type TrackerInsert = typeof trackers.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type VoteInsert = typeof votes.$inferInsert;
