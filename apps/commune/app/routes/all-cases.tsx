import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/all-cases";
import { getCasesWithStats } from "~/lib/server/queries";
import { withCache, CACHE_TTL } from "~/lib/server/cache";

export async function loader(_args: Route.LoaderArgs) {
  const cases = await withCache("cases:list:all", () => getCasesWithStats(), CACHE_TTL.CASE_LIST);
  return { cases };
}

function timeAgo(date: Date | string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function DocketPage() {
  const { cases } = useLoaderData<typeof loader>();

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-6">
        <div className="max-w-xs space-y-3">
          <p className="text-2xl font-semibold tracking-tight">The docket is empty.</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Describe a situation. Your friends deliberate anonymously. You get honest signal — not a
            polished group-chat consensus.
          </p>
        </div>
        <Link
          to="/case/create"
          className="bg-foreground text-background px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          File a case
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-base font-semibold">Your docket</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {cases.length} case{cases.length !== 1 ? "s" : ""} filed
          </p>
        </div>
        <Link
          to="/case/create"
          className="bg-foreground text-background px-4 py-2 rounded-full text-xs font-medium hover:opacity-90 transition-opacity"
        >
          + File a case
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-border border border-border rounded-xl overflow-hidden">
        {cases.map((c, i) => {
          const { total, agreePercent, quorumMet, agree, disagree } = c.voteStats;
          const remaining = c.quorumSize - total;
          const situationPreview =
            c.neutralSituation.slice(0, 120) + (c.neutralSituation.length > 120 ? "…" : "");

          return (
            <Link
              key={c.id}
              to={`/case/${c.id}`}
              className="flex flex-col gap-3 px-5 py-4 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">
                      #{String(i + 1).padStart(3, "0")}
                    </span>
                    <span className="text-xs font-medium truncate">
                      {c.label ||
                        (c.question.length > 50 ? c.question.slice(0, 48) + "…" : c.question)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {situationPreview}
                  </p>
                </div>

                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  {quorumMet ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-foreground text-background">
                      Verdict in
                    </span>
                  ) : c.status === "closed" ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      Closed
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      {remaining} vote{remaining !== 1 ? "s" : ""} to go
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                </div>
              </div>

              {quorumMet && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex rounded-full overflow-hidden h-1.5">
                    <div
                      className="bg-green-500 transition-all"
                      style={{ width: `${agreePercent}%` }}
                    />
                    <div
                      className="bg-red-400 transition-all"
                      style={{ width: `${100 - agreePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-green-600 font-medium">
                      {agreePercent}% agree · {agree}
                    </span>
                    <span className="text-red-500 font-medium">{disagree} disagree</span>
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
