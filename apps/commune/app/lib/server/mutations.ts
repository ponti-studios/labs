import { eq } from "@pontistudios/db";
import { caseUpdates, db, relationshipCases, relationshipVerdicts } from "@pontistudios/db";
import type {
  CaseUpdate,
  NewRelationshipCase,
  NewRelationshipVerdict,
  RelationshipCase,
  RelationshipVerdict,
} from "@pontistudios/db";
import { invalidateCaseCache, queryCache } from "./cache";

type CaseCreateInput = Pick<
  NewRelationshipCase,
  "userId" | "label" | "rawSituation" | "neutralSituation" | "question" | "quorumSize"
>;

type VerdictCreateInput = Pick<
  NewRelationshipVerdict,
  "caseId" | "fingerprint" | "value" | "comment" | "updateId" | "updateRound" | "userId"
>;

type CaseUpdateCreateInput = {
  caseId: string;
  rawContent: string;
  neutralContent: string;
  round: number;
};

export async function createCase(data: CaseCreateInput): Promise<RelationshipCase> {
  const row = await db
    .insert(relationshipCases)
    .values({ id: crypto.randomUUID(), ...data, createdAt: new Date() })
    .returning()
    .execute();
  const inserted = row[0];
  if (!inserted) throw new Error("Failed to insert case");
  queryCache.invalidatePattern(/^cases:/);
  return inserted;
}

async function closeCase(id: string): Promise<RelationshipCase | null> {
  const row = await db
    .update(relationshipCases)
    .set({ status: "closed" })
    .where(eq(relationshipCases.id, id))
    .returning()
    .execute();
  const updated = row[0] ?? null;
  if (updated) invalidateCaseCache(id);
  return updated;
}

async function deleteCase(id: string): Promise<void> {
  await db.delete(relationshipCases).where(eq(relationshipCases.id, id)).execute();
  invalidateCaseCache(id);
  queryCache.invalidatePattern(/^cases:/);
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

async function createCaseUpdate(data: CaseUpdateCreateInput): Promise<CaseUpdate> {
  const row = await db
    .insert(caseUpdates)
    .values({ id: crypto.randomUUID(), ...data, createdAt: new Date() })
    .returning()
    .execute();
  const inserted = row[0];
  if (!inserted) throw new Error("Failed to insert case update");
  invalidateCaseCache(data.caseId);
  return inserted;
}
