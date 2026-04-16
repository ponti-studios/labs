import {
  pgTable,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

export const trackers = pgTable('trackers', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  name: text('name').notNull(),
  hp: text('hp'),
  cardType: text('card_type'),
  description: text('description'),
  attacks: text('attacks'),
  strengths: text('strengths'),
  flaws: text('flaws'),
  commitmentLevel: text('commitment_level'),
  colorTheme: text('color_theme'),
  photoUrl: text('photo_url'),
  imageScale: integer('image_scale'),
  imagePosition: text('image_position'),
  userId: text('user_id').notNull(),
});

export const votes = pgTable('votes', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  trackerId: text('tracker_id').notNull(),
  userId: text('user_id'),
  fingerprint: text('fingerprint').notNull(),
  raterName: text('rater_name').notNull(),
  value: text('value').notNull(),
  comment: text('comment'),
});

export type DumphimTracker = typeof trackers.$inferSelect;
export type NewDumphimTracker = typeof trackers.$inferInsert;
export type DumphimVote = typeof votes.$inferSelect;
export type NewDumphimVote = typeof votes.$inferInsert;

export interface DumphimTrackerParsed {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  hp: string | null;
  cardType: string | null;
  description: string | null;
  attacks: { name: string; damage: number }[];
  strengths: string[];
  flaws: string[];
  commitmentLevel: string | null;
  colorTheme: string | null;
  photoUrl: string | null;
  imageScale: number | null;
  imagePosition: { x: number; y: number } | null;
  userId: string;
}
