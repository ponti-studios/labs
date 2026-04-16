import { pgTable, text, timestamp, numeric } from 'drizzle-orm/pg-core';

export const disasterEvents = pgTable('disaster_events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  sourceUrl: text('source_url'),
  categoryId: text('category_id').notNull(),
  categoryTitle: text('category_title').notNull(),
  occurredAt: text('occurred_at').notNull(),
  geometryType: text('geometry_type').notNull(),
  latitude: numeric('latitude').notNull(),
  longitude: numeric('longitude').notNull(),
  closedAt: text('closed_at'),
  source: text('source'),
  timestamp: text('timestamp'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type DisasterEvent = typeof disasterEvents.$inferSelect;
export type NewDisasterEvent = typeof disasterEvents.$inferInsert;

