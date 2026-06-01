import { sql, desc, eq, inArray } from "@pontistudios/db";
import { db, relationshipCases, relationshipVerdicts } from "@pontistudios/db";
import type { RelationshipCase, RelationshipCaseParsed, RelationshipVerdict } from "@pontistudios/db";

function parseCase(raw: RelationshipCase): RelationshipCaseParsed {
  return {
    ...(raw as unknown as Omit<RelationshipCaseParsed, "attacks" | "strengths" | "flaws" | "imagePosition">),
    attacks: typeof raw.attacks === "string" ? JSON.parse(raw.attacks) : (raw.attacks ?? []),
    strengths: typeof raw.strengths === "string" ? JSON.parse(raw.strengths) : (raw.strengths ?? []),
    flaws: typeof raw.flaws === "string" ? JSON.parse(raw.flaws) : (raw.flaws ?? []),
    imagePosition:
      typeof raw.imagePosition === "string" ? JSON.parse(raw.imagePosition) : (raw.imagePosition ?? null),
  };
}

export async function getCases(): Promise<RelationshipCaseParsed[]> {
  const rows = await db.select().from(relationshipCases).orderBy(desc(relationshipCases.createdAt)).execute();
  return rows.map(parseCase);
}

export async function getCase(id: string): Promise<RelationshipCaseParsed | null> {
  const row = await db.select().from(relationshipCases).where(eq(relationshipCases.id, id)).execute();
  return row[0] ? parseCase(row[0]) : null;
}

export async function getCasesByUser(userId: string): Promise<RelationshipCaseParsed[]> {
  const rows = await db
    .select()
    .from(relationshipCases)
    .where(eq(relationshipCases.userId, userId))
    .orderBy(desc(relationshipCases.createdAt))
    .execute();
  return rows.map(parseCase);
}

export async function getVerdictsByCase(caseId: string): Promise<RelationshipVerdict[]> {
  return db
    .select()
    .from(relationshipVerdicts)
    .where(eq(relationshipVerdicts.caseId, caseId))
    .orderBy(desc(relationshipVerdicts.createdAt))
    .execute();
}

export async function getVerdictStats(caseId: string): Promise<{
  total: number;
  stay: number;
  dump: number;
  stayPercentage: number;
}> {
  const result = await db
    .select({
      total: sql<number>`count(*)`.as("total"),
      stay: sql<number>`sum(case when value = 'stay' then 1 else 0 end)`.as("stay"),
      dump: sql<number>`sum(case when value = 'dump' then 1 else 0 end)`.as("dump"),
    })
    .from(relationshipVerdicts)
    .where(eq(relationshipVerdicts.caseId, caseId))
    .execute();

  const row = result[0];
  const total = Number(row?.total) || 0;
  const stay = Number(row?.stay) || 0;
  const dump = Number(row?.dump) || 0;
  return { total, stay, dump, stayPercentage: total > 0 ? Math.round((stay / total) * 100) : 0 };
}

export async function getCasesWithStats(): Promise<
  (RelationshipCaseParsed & { voteStats: { total: number; stay: number; stayPercentage: number } })[]
> {
  const allCases = await getCases();
  if (allCases.length === 0) return [];

  const caseIds = allCases.map((c) => c.id);
  const verdictStats = await db
    .select({
      caseId: relationshipVerdicts.caseId,
      total: sql<number>`count(*)`.as("total"),
      stay: sql<number>`sum(case when value = 'stay' then 1 else 0 end)`.as("stay"),
    })
    .from(relationshipVerdicts)
    .where(inArray(relationshipVerdicts.caseId, caseIds))
    .groupBy(relationshipVerdicts.caseId)
    .execute();

  const statsMap = new Map(
    verdictStats.map((s) => [
      s.caseId,
      {
        total: Number(s.total) || 0,
        stay: Number(s.stay) || 0,
        stayPercentage: Number(s.total) > 0 ? Math.round((Number(s.stay) / Number(s.total)) * 100) : 0,
      },
    ]),
  );

  return allCases.map((c) => ({
    ...c,
    voteStats: statsMap.get(c.id) || { total: 0, stay: 0, stayPercentage: 0 },
  }));
}

export async function getCaseWithStats(id: string): Promise<
  | (RelationshipCaseParsed & {
      voteStats: { total: number; stay: number; dump: number; stayPercentage: number };
    })
  | null
> {
  const [caseRecord, stats] = await Promise.all([getCase(id), getVerdictStats(id)]);
  if (!caseRecord) return null;
  return { ...caseRecord, voteStats: stats };
}
