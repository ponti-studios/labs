import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  phoneNumber: text('phone_number').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  dailySignsEnabled: integer('daily_signs_enabled').notNull().default(0),
  lastSignSent: timestamp('last_sign_sent'),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type KumaUser = typeof users.$inferSelect;
export type NewKumaUser = typeof users.$inferInsert;
export type KumaMessage = typeof messages.$inferSelect;
export type NewKumaMessage = typeof messages.$inferInsert;
