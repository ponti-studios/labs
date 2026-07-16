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
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="max-w-xs space-y-3">
          <p className="text-2xl font-semibold tracking-tight">The docket is empty.</p>
          <p className="text-secondary text-sm leading-relaxed">
            Describe a situation. Your friends deliberate anonymously. You get honest signal — not a
            polished group-chat consensus.
          </p>
        </div>
        <Link
          to="/case/create"
          className="bg-accent text-on-accent rounded-full px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
        >
          File a case
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Your docket</h1>
          <p className="text-secondary mt-0.5 text-xs">
            {cases.length} case{cases.length !== 1 ? "s" : ""} filed
          </p>
        </div>
        <Link
          to="/case/create"
          className="bg-accent text-on-accent rounded-full px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90"
        >
          + File a case
        </Link>
      </div>

      <div className="divide-border border-default flex flex-col divide-y overflow-hidden rounded-xl border">
        {cases.map((c, i) => {
          const { total, agreePercent, quorumMet, agree, disagree } = c.voteStats;
          const remaining = c.quorumSize - total;
          const situationPreview =
            c.neutralSituation.slice(0, 120) + (c.neutralSituation.length > 120 ? "…" : "");

          return (
            <Link
              key={c.id}
              to={`/case/${c.id}`}
              className="hover:bg-inset/40 flex flex-col gap-3 px-5 py-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-secondary flex-shrink-0 font-mono text-[10px]">
                      #{String(i + 1).padStart(3, "0")}
                    </span>
                    <span className="truncate text-xs font-medium">
                      {c.question.length > 50 ? c.question.slice(0, 48) + "…" : c.question}
                    </span>
                  </div>
                  <p className="text-secondary line-clamp-2 text-xs leading-relaxed">
                    {situationPreview}
                  </p>
                </div>

                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                  {quorumMet ? (
                    <span className="bg-accent text-on-accent rounded-full px-2 py-0.5 text-[10px] font-medium">
                      Verdict in
                    </span>
                  ) : c.status === "closed" ? (
                    <span className="border-default text-secondary rounded-full border px-2 py-0.5 text-[10px] font-medium">
                      Closed
                    </span>
                  ) : (
                    <span className="border-default text-secondary rounded-full border px-2 py-0.5 text-[10px] font-medium">
                      {remaining} vote{remaining !== 1 ? "s" : ""} to go
                    </span>
                  )}
                  <span className="text-secondary text-[10px]">{timeAgo(c.createdAt)}</span>
                </div>
              </div>

              {quorumMet && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex h-1.5 overflow-hidden rounded-full">
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
                    <span className="font-medium text-green-600">
                      {agreePercent}% agree · {agree}
                    </span>
                    <span className="font-medium text-red-500">{disagree} disagree</span>
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
