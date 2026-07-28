import { index, integer, text, timestamp } from "drizzle-orm/pg-core";
import { labs } from "./base";

export const relationshipCases = labs.table("relationship_cases", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id"),
  label: text("label"),
  rawSituation: text("raw_situation").notNull(),
  neutralSituation: text("neutral_situation").notNull(),
  question: text("question").notNull(),
  quorumSize: integer("quorum_size").notNull().default(3),
  status: text("status", { enum: ["open", "closed"] })
    .notNull()
    .default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const caseUpdates = labs.table(
  "case_updates",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    caseId: text("case_id")
      .notNull()
      .references(() => relationshipCases.id, { onDelete: "cascade" }),
    rawContent: text("raw_content").notNull(),
    neutralContent: text("neutral_content").notNull(),
    round: integer("round").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("case_updates_case_id_idx").on(table.caseId)],
);

export const relationshipVerdicts = labs.table(
  "relationship_verdicts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    caseId: text("case_id")
      .notNull()
      .references(() => relationshipCases.id, { onDelete: "cascade" }),
    updateId: text("update_id").references(() => caseUpdates.id, { onDelete: "cascade" }),
    updateRound: integer("update_round").notNull().default(0),
    userId: text("user_id"),
    fingerprint: text("fingerprint").notNull(),
    value: text("value", { enum: ["agree", "disagree"] }).notNull(),
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("relationship_verdicts_case_id_idx").on(table.caseId)],
);

export type RelationshipCase = typeof relationshipCases.$inferSelect;
export type NewRelationshipCase = typeof relationshipCases.$inferInsert;
export type CaseUpdate = typeof caseUpdates.$inferSelect;
export type NewCaseUpdate = typeof caseUpdates.$inferInsert;
export type RelationshipVerdict = typeof relationshipVerdicts.$inferSelect;
export type NewRelationshipVerdict = typeof relationshipVerdicts.$inferInsert;
