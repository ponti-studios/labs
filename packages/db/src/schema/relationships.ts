import { pgSchema, pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

const labs = pgSchema("labs");

export const relationshipPeople = labs.table("relationship_people", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id").notNull(),
  displayName: text("display_name").notNull(),
  status: text("status").notNull(),
  currentStage: text("current_stage").notNull(),
  startedAt: text("started_at"),
  endedAt: text("ended_at"),
  headline: text("headline"),
  profileSummary: text("profile_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relationshipStageHistory = labs.table("relationship_stage_history", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull(),
  fromStage: text("from_stage"),
  toStage: text("to_stage").notNull(),
  effectiveAt: text("effective_at").notNull(),
  createdByUserId: text("created_by_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const relationshipEvents = labs.table("relationship_events", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull(),
  ownerUserId: text("owner_user_id").notNull(),
  eventType: text("event_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  occurredAt: text("occurred_at").notNull(),
  sentiment: text("sentiment").notNull(),
  intensity: integer("intensity"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relationshipNotes = labs.table("relationship_notes", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull(),
  ownerUserId: text("owner_user_id").notNull(),
  title: text("title"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relationshipCheckins = labs.table("relationship_checkins", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull(),
  ownerUserId: text("owner_user_id").notNull(),
  moodScore: integer("mood_score").notNull(),
  clarityScore: integer("clarity_score").notNull(),
  trustScore: integer("trust_score").notNull(),
  compatibilityScore: integer("compatibility_score").notNull(),
  energyScore: integer("energy_score").notNull(),
  notes: text("notes"),
  recordedAt: text("recorded_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const relationshipFlags = labs.table("relationship_flags", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull(),
  ownerUserId: text("owner_user_id").notNull(),
  flagType: text("flag_type").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  source: text("source").notNull(),
  severity: integer("severity"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relationshipFriendInvites = labs.table("relationship_friend_invites", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull(),
  ownerUserId: text("owner_user_id").notNull(),
  inviteToken: text("invite_token").notNull(),
  status: text("status").notNull(),
  expiresAt: text("expires_at"),
  shareSummary: integer("share_summary").notNull().default(0),
  shareTimeline: integer("share_timeline").notNull().default(0),
  shareFlags: integer("share_flags").notNull().default(0),
  shareCheckins: integer("share_checkins").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relationshipFriendVotes = labs.table("relationship_friend_votes", {
  id: text("id").primaryKey(),
  inviteId: text("invite_id").notNull(),
  personId: text("person_id").notNull(),
  voterName: text("voter_name").notNull(),
  voterContactHint: text("voter_contact_hint"),
  vote: text("vote").notNull(),
  confidenceScore: integer("confidence_score"),
  commentary: text("commentary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relationshipMetricsDaily = labs.table("relationship_metrics_daily", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull(),
  metricDate: text("metric_date").notNull(),
  healthScore: text("health_score").notNull(),
  friendSentimentScore: text("friend_sentiment_score"),
  redFlagCount: integer("red_flag_count").notNull().default(0),
  greenFlagCount: integer("green_flag_count").notNull().default(0),
  eventCount: integer("event_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RelationshipPerson = typeof relationshipPeople.$inferSelect;
export type NewRelationshipPerson = typeof relationshipPeople.$inferInsert;
export type RelationshipPersonUpdate = Partial<typeof relationshipPeople.$inferSelect>;
export type RelationshipStageHistory = typeof relationshipStageHistory.$inferSelect;
export type NewRelationshipStageHistory = typeof relationshipStageHistory.$inferInsert;
export type RelationshipEvent = typeof relationshipEvents.$inferSelect;
export type NewRelationshipEvent = typeof relationshipEvents.$inferInsert;
export type RelationshipNote = typeof relationshipNotes.$inferSelect;
export type NewRelationshipNote = typeof relationshipNotes.$inferInsert;
export type RelationshipCheckin = typeof relationshipCheckins.$inferSelect;
export type NewRelationshipCheckin = typeof relationshipCheckins.$inferInsert;
export type RelationshipFlag = typeof relationshipFlags.$inferSelect;
export type NewRelationshipFlag = typeof relationshipFlags.$inferInsert;
export type RelationshipInvite = typeof relationshipFriendInvites.$inferSelect;
export type NewRelationshipInvite = typeof relationshipFriendInvites.$inferInsert;
export type RelationshipVote = typeof relationshipFriendVotes.$inferSelect;
export type NewRelationshipVote = typeof relationshipFriendVotes.$inferInsert;
export type RelationshipMetricDaily = typeof relationshipMetricsDaily.$inferSelect;
export type NewRelationshipMetricDaily = typeof relationshipMetricsDaily.$inferInsert;
