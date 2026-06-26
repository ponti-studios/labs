import { eq } from "@pontistudios/db";
import { db, relationshipCases, relationshipVerdicts } from "@pontistudios/db";
import type { NewRelationshipCase, NewRelationshipVerdict, RelationshipCase, RelationshipVerdict } from "@pontistudios/db";
import { queryCache } from "./cache";

type CaseRow = Omit<RelationshipCase, "label">;

type CaseCreateInput = Pick<
  NewRelationshipCase,
  "userId" | "rawSituation" | "neutralSituation" | "question" | "quorumSize"
>;

type VerdictCreateInput = Pick<
  NewRelationshipVerdict,
  "caseId" | "fingerprint" | "value" | "comment" | "updateId" | "updateRound" | "userId"
>;
const caseSelect = {
  id: relationshipCases.id,
  userId: relationshipCases.userId,
  rawSituation: relationshipCases.rawSituation,
  neutralSituation: relationshipCases.neutralSituation,
  question: relationshipCases.question,
  quorumSize: relationshipCases.quorumSize,
  status: relationshipCases.status,
  createdAt: relationshipCases.createdAt,
} satisfies Record<keyof CaseRow, unknown>;

export async function createCase(data: CaseCreateInput): Promise<CaseRow> {
  const id = crypto.randomUUID();
  await db
    .insert(relationshipCases)
    .values({ id, ...data, createdAt: new Date() })
    .execute();
  const row = await db.select(caseSelect).from(relationshipCases).where(eq(relationshipCases.id, id)).execute();
  const inserted = row[0];
  if (!inserted) throw new Error("Failed to insert case");
  queryCache.invalidatePattern(/^cases:/);
  return inserted;
}

export async function createVerdict(data: VerdictCreateInput): Promise<RelationshipVerdict> {
  const row = await db
    .insert(relationshipVerdicts)
    .values({ id: crypto.randomUUID(), ...data, createdAt: new Date() })
    .returning()
    .execute();
  const inserted = row[0];
  if (!inserted) throw new Error("Failed to insert verdict");
  queryCache.invalidate(`case:${data.caseId}:stats`);
  queryCache.invalidate(`case:${data.caseId}`);
  return inserted;
}
