import { sql, desc, eq, inArray } from "@pontistudios/db";
import { db, relationshipCases, relationshipVerdicts, caseUpdates } from "@pontistudios/db";
import type { CaseUpdate, RelationshipCase, RelationshipVerdict } from "@pontistudios/db";

export type CaseWithStats = RelationshipCase & {
  voteStats: {
    total: number;
    agree: number;
    disagree: number;
    agreePercent: number;
    quorumMet: boolean;
  };
};

export async function getCases(): Promise<RelationshipCase[]> {
  return db.select().from(relationshipCases).orderBy(desc(relationshipCases.createdAt)).execute();
}

export async function getCase(id: string): Promise<RelationshipCase | null> {
  const rows = await db
    .select()
    .from(relationshipCases)
    .where(eq(relationshipCases.id, id))
    .execute();
  return rows[0] ?? null;
}

export async function getCaseUpdates(caseId: string): Promise<CaseUpdate[]> {
  return db
    .select()
    .from(caseUpdates)
    .where(eq(caseUpdates.caseId, caseId))
    .orderBy(caseUpdates.round)
    .execute();
}

export async function getVerdictsByCase(caseId: string): Promise<RelationshipVerdict[]> {
  return db
    .select()
    .from(relationshipVerdicts)
    .where(eq(relationshipVerdicts.caseId, caseId))
    .orderBy(desc(relationshipVerdicts.createdAt))
    .execute();
}

export async function getVerdictStats(
  caseId: string,
  quorumSize: number,
): Promise<CaseWithStats["voteStats"]> {
  const result = await db
    .select({
      total: sql<number>`count(*)`.as("total"),
      agree: sql<number>`sum(case when value = 'agree' then 1 else 0 end)`.as("agree"),
    })
    .from(relationshipVerdicts)
    .where(eq(relationshipVerdicts.caseId, caseId))
    .execute();

  const row = result[0];
  const total = Number(row?.total) || 0;
  const agree = Number(row?.agree) || 0;
  const disagree = total - agree;
  return {
    total,
    agree,
    disagree,
    agreePercent: total > 0 ? Math.round((agree / total) * 100) : 0,
    quorumMet: total >= quorumSize,
  };
}

export async function getCasesWithStats(): Promise<CaseWithStats[]> {
  const allCases = await getCases();
  if (allCases.length === 0) return [];

  const caseIds = allCases.map((c) => c.id);
  const verdictStats = await db
    .select({
      caseId: relationshipVerdicts.caseId,
      total: sql<number>`count(*)`.as("total"),
      agree: sql<number>`sum(case when value = 'agree' then 1 else 0 end)`.as("agree"),
    })
    .from(relationshipVerdicts)
    .where(inArray(relationshipVerdicts.caseId, caseIds))
    .groupBy(relationshipVerdicts.caseId)
    .execute();

  const statsMap = new Map(
    verdictStats.map((s) => [
      s.caseId,
      { total: Number(s.total) || 0, agree: Number(s.agree) || 0 },
    ]),
  );

  return allCases.map((c) => {
    const raw = statsMap.get(c.id) ?? { total: 0, agree: 0 };
    const disagree = raw.total - raw.agree;
    return {
      ...c,
      voteStats: {
        total: raw.total,
        agree: raw.agree,
        disagree,
        agreePercent: raw.total > 0 ? Math.round((raw.agree / raw.total) * 100) : 0,
        quorumMet: raw.total >= c.quorumSize,
      },
    };
  });
}

export async function getCaseWithStats(
  id: string,
): Promise<(CaseWithStats & { updates: CaseUpdate[] }) | null> {
  const caseRecord = await getCase(id);
  if (!caseRecord) return null;
  const [stats, updates] = await Promise.all([
    getVerdictStats(id, caseRecord.quorumSize),
    getCaseUpdates(id),
  ]);
  return { ...caseRecord, voteStats: stats, updates };
}
