import { eq } from "@pontistudios/db";
import { db, relationshipCases, relationshipVerdicts } from "@pontistudios/db";
import type { NewRelationshipCase, NewRelationshipVerdict, RelationshipCase, RelationshipVerdict } from "@pontistudios/db";
import { queryCache, invalidateCaseCache } from "./cache";

export type CaseCreateInput = Omit<NewRelationshipCase, "id" | "createdAt" | "updatedAt">;
export type VerdictCreateInput = Omit<NewRelationshipVerdict, "id" | "createdAt" | "updatedAt">;

export async function createCase(data: CaseCreateInput): Promise<RelationshipCase> {
  const row = await db
    .insert(relationshipCases)
    .values({ id: crypto.randomUUID(), ...data, createdAt: new Date(), updatedAt: new Date() })
    .returning()
    .execute();
  const inserted = row[0];
  if (!inserted) throw new Error("Failed to insert case");
  queryCache.invalidatePattern(/^cases:/);
  return inserted;
}

export async function updateCase(
  id: string,
  data: Partial<NewRelationshipCase>,
): Promise<RelationshipCase | null> {
  const updateValues: Record<string, unknown> = {};
  if (data.name !== undefined) updateValues.name = data.name;
  if (data.hp !== undefined) updateValues.hp = data.hp;
  if (data.cardType !== undefined) updateValues.cardType = data.cardType;
  if (data.description !== undefined) updateValues.description = data.description;
  if (data.attacks !== undefined) updateValues.attacks = data.attacks;
  if (data.strengths !== undefined) updateValues.strengths = data.strengths;
  if (data.flaws !== undefined) updateValues.flaws = data.flaws;
  if (data.commitmentLevel !== undefined) updateValues.commitmentLevel = data.commitmentLevel;
  if (data.colorTheme !== undefined) updateValues.colorTheme = data.colorTheme;
  if (data.photoUrl !== undefined) updateValues.photoUrl = data.photoUrl;
  if (data.imageScale !== undefined) updateValues.imageScale = data.imageScale;
  if (data.imagePosition !== undefined) updateValues.imagePosition = data.imagePosition;
  if (data.userId !== undefined) updateValues.userId = data.userId;
  updateValues.updatedAt = new Date();

  const row = await db
    .update(relationshipCases)
    .set(updateValues)
    .where(eq(relationshipCases.id, id))
    .returning()
    .execute();
  const updated = row[0] ?? null;
  if (updated) invalidateCaseCache(id);
  return updated;
}

export async function deleteCase(id: string): Promise<void> {
  await db.delete(relationshipCases).where(eq(relationshipCases.id, id)).execute();
  invalidateCaseCache(id);
  queryCache.invalidatePattern(/^cases:/);
}

export async function createVerdict(data: VerdictCreateInput): Promise<RelationshipVerdict> {
  const row = await db
    .insert(relationshipVerdicts)
    .values({ id: crypto.randomUUID(), ...data, createdAt: new Date(), updatedAt: new Date() })
    .returning()
    .execute();
  const inserted = row[0];
  if (!inserted) throw new Error("Failed to insert verdict");
  queryCache.invalidate(`case:${data.caseId}:stats`);
  queryCache.invalidate(`case:${data.caseId}`);
  return inserted;
}

export async function deleteVerdict(id: string, caseId: string): Promise<void> {
  await db.delete(relationshipVerdicts).where(eq(relationshipVerdicts.id, id)).execute();
  queryCache.invalidate(`case:${caseId}:stats`);
  queryCache.invalidate(`case:${caseId}`);
}

export async function deleteVerdictsByCase(caseId: string): Promise<void> {
  await db.delete(relationshipVerdicts).where(eq(relationshipVerdicts.caseId, caseId)).execute();
  queryCache.invalidate(`case:${caseId}:stats`);
}
