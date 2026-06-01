import { index, integer, jsonb, text, timestamp } from "drizzle-orm/pg-core";
import { labs } from "./base";

export const relationshipCases = labs.table("relationship_cases", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  hp: text("hp"),
  cardType: text("card_type"),
  description: text("description"),
  attacks: jsonb("attacks").$type<{ name: string; damage: number }[]>(),
  strengths: jsonb("strengths").$type<string[]>(),
  flaws: jsonb("flaws").$type<string[]>(),
  commitmentLevel: text("commitment_level"),
  colorTheme: text("color_theme"),
  photoUrl: text("photo_url"),
  imageScale: integer("image_scale"),
  imagePosition: jsonb("image_position").$type<{ x: number; y: number }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relationshipVerdicts = labs.table(
  "relationship_verdicts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    caseId: text("case_id")
      .notNull()
      .references(() => relationshipCases.id, { onDelete: "cascade" }),
    userId: text("user_id"),
    fingerprint: text("fingerprint").notNull(),
    value: text("value").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("relationship_verdicts_case_id_idx").on(table.caseId)],
);

export type RelationshipCase = typeof relationshipCases.$inferSelect;
export type NewRelationshipCase = typeof relationshipCases.$inferInsert;
export type RelationshipVerdict = typeof relationshipVerdicts.$inferSelect;
export type NewRelationshipVerdict = typeof relationshipVerdicts.$inferInsert;

export interface RelationshipCaseParsed {
  id: string;
  createdAt: Date;
  updatedAt: Date;
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
