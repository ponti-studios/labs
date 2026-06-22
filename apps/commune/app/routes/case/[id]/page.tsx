import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { CACHE_TTL, invalidateCaseCache, withCache } from "~/lib/server/cache";
import { createVerdict } from "~/lib/server/mutations";
import { getCaseWithStats, getVerdictsByCase } from "~/lib/server/queries";
import { generateFingerprint } from "~/lib/voter.utils";
import type { Route } from "./+types/page";

export async function loader({ params }: Route.LoaderArgs) {
  const caseId = params.id;
  const [caseRecord, verdicts] = await Promise.all([
    withCache(`case:${caseId}`, () => getCaseWithStats(caseId), CACHE_TTL.CASE_DETAIL),
    getVerdictsByCase(caseId),
  ]);
  if (!caseRecord) throw new Response("Not found", { status: 404 });
  return { caseRecord, verdicts };
}

export async function action({ request, params }: Route.ActionArgs) {
  const caseId = params.id;
  if (!caseId) throw new Response("Missing caseId", { status: 400 });
  const formData = await request.formData();
  const value = formData.get("value") as "agree" | "disagree";
  const fingerprint = formData.get("fingerprint") as string;
  const comment = formData.get("comment") as string;
  if (!value || !fingerprint || !comment?.trim()) return { error: "Missing fields" };
  try {
    const verdict = await createVerdict({
      value,
      fingerprint,
      userId: null,
      caseId,
      comment: comment.trim(),
      updateRound: 0,
    });
    invalidateCaseCache(caseId);
    return { success: true, verdict };
  } catch {
    return { error: "Failed to submit" };
  }
}

function timeAgo(date: Date | string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function CaseDetailPage() {
  const { caseRecord, verdicts: initialVerdicts } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [isOwner, setIsOwner] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedVote, setSelectedVote] = useState<"agree" | "disagree" | null>(null);
  const [comment, setComment] = useState("");
  const [copied, setCopied] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const localVerdicts = initialVerdicts;
  const { voteStats, quorumSize } = caseRecord;
  const { total, agree, disagree, agreePercent, quorumMet } = voteStats;
  const remaining = quorumSize - total;

  useEffect(() => {
    const owned: string[] = JSON.parse(localStorage.getItem("commune:owned") ?? "[]");
    setIsOwner(owned.includes(caseRecord.id));
    const fp = generateFingerprint();
    setHasVoted(localVerdicts.some((v) => v.fingerprint === fp));
  }, [caseRecord.id, localVerdicts]);

  useEffect(() => {
    if (fetcher.data && "success" in fetcher.data && fetcher.data.success) {
      setHasVoted(true);
      setSelectedVote(null);
      setComment("");
    }
  }, [fetcher.data]);

  const handleSubmit = () => {
    if (!selectedVote || !comment.trim() || hasVoted) return;
    const fp = generateFingerprint();
    const fd = new FormData();
    fd.append("value", selectedVote);
    fd.append("fingerprint", fp);
    fd.append("comment", comment.trim());
    fetcher.submit(fd, { method: "post" });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showResults = quorumMet || isOwner;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Case header */}
      <div className="mb-8 flex flex-col gap-1">
        {caseRecord.label && (
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            {caseRecord.label}
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] text-muted-foreground">{timeAgo(caseRecord.createdAt)}</p>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
              caseRecord.status === "closed"
                ? "border-border text-muted-foreground"
                : quorumMet
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground"
            }`}
          >
            {caseRecord.status === "closed"
              ? "Closed"
              : quorumMet
                ? "Verdict in"
                : `${remaining} vote${remaining !== 1 ? "s" : ""} to go`}
          </span>
        </div>
      </div>

      {/* The situation (neutralized) */}
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          The situation
        </p>
        <p className="text-sm leading-relaxed">{caseRecord.neutralSituation}</p>
      </div>

      {/* The question */}
      <div className="mb-8 rounded-xl border border-border bg-muted/30 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          The question
        </p>
        <p className="text-sm font-medium">{caseRecord.question}</p>
      </div>

      {/* Results — only visible after quorum, or to owner */}
      {showResults && total > 0 && (
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            The jury's verdict
          </p>
          <div className="flex rounded-full overflow-hidden h-2">
            <div className="bg-green-500 transition-all" style={{ width: `${agreePercent}%` }} />
            <div
              className="bg-red-400 transition-all"
              style={{ width: `${100 - agreePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-green-600 font-medium">
              {agreePercent}% agree · {agree}
            </span>
            <span className="text-red-500 font-medium">{disagree} disagree</span>
          </div>
        </div>
      )}

      {/* Takes */}
      {showResults && localVerdicts.length > 0 && (
        <div className="mb-8 flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Takes ({total})
          </p>
          <div className="flex flex-col divide-y divide-border border border-border rounded-xl overflow-hidden">
            {localVerdicts.map((v) => (
              <div key={v.id} className="flex gap-3 items-start px-4 py-3">
                <span
                  className={`text-[10px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap flex-shrink-0 mt-0.5 ${
                    v.value === "agree" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {v.value === "agree" ? "Agree" : "Disagree"}
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-xs leading-relaxed">"{v.comment}"</p>
                  <p className="text-[10px] text-muted-foreground">{timeAgo(v.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deliberating state — jury hasn't reached quorum, show how many left */}
      {!showResults && !isOwner && !hasVoted && (
        <div className="mb-8 rounded-xl border border-border bg-muted/20 px-5 py-4">
          <p className="text-xs text-muted-foreground text-center">
            Results reveal after {remaining} more vote{remaining !== 1 ? "s" : ""}. Yours is
            independent — no one else's take influences your read.
          </p>
        </div>
      )}

      {/* Owner actions */}
      {isOwner && (
        <div className="flex flex-col gap-3 mb-8">
          <button
            type="button"
            onClick={handleShare}
            className="w-full bg-foreground text-background rounded-full py-3 text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
            {copied ? "Link copied!" : "Share with your jury"}
          </button>
          {!quorumMet && (
            <p className="text-[10px] text-center text-muted-foreground">
              Send this link to {remaining} friend{remaining !== 1 ? "s" : ""}. They vote blindly —
              results reveal after quorum.
            </p>
          )}
        </div>
      )}

      {/* Jury: vote form */}
      {!isOwner && !hasVoted && caseRecord.status === "open" && (
        <div className="flex flex-col gap-4 border-t border-border pt-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Your take
          </p>

          {/* Comment required first */}
          <div className="flex flex-col gap-2">
            <textarea
              ref={commentRef}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your honest take first — before voting."
              rows={3}
              className="w-full text-sm border border-input rounded-xl px-4 py-3 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground leading-relaxed"
            />
            <p className="text-[10px] text-muted-foreground">
              You'll see the current vote breakdown after you weigh in.
            </p>
          </div>

          {/* Vote buttons only appear once comment is written */}
          {comment.trim().length >= 10 && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedVote("agree")}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all border ${
                  selectedVote === "agree"
                    ? "border-2 border-green-500 bg-green-50 text-green-700"
                    : selectedVote === "disagree"
                      ? "border-green-200 text-green-400 opacity-50"
                      : "border-green-400 text-green-600"
                }`}
              >
                ✓ Agree
              </button>
              <button
                type="button"
                onClick={() => setSelectedVote("disagree")}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all border ${
                  selectedVote === "disagree"
                    ? "border-2 border-red-500 bg-red-50 text-red-600"
                    : selectedVote === "agree"
                      ? "border-red-200 text-red-400 opacity-50"
                      : "border-red-400 text-red-500"
                }`}
              >
                ✕ Disagree
              </button>
            </div>
          )}

          {selectedVote && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={fetcher.state === "submitting" || !comment.trim()}
              className={`w-full py-3 rounded-full text-xs font-semibold text-white transition-opacity disabled:opacity-60 ${
                selectedVote === "agree" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {fetcher.state === "submitting" ? "Submitting…" : `Submit — ${selectedVote}`}
            </button>
          )}
        </div>
      )}

      {!isOwner && hasVoted && (
        <div className="border-t border-border pt-6">
          {!quorumMet ? (
            <p className="text-xs text-muted-foreground text-center">
              Your take is in. Results reveal after {remaining} more vote
              {remaining !== 1 ? "s" : ""}.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground text-center">You've already weighed in.</p>
          )}
        </div>
      )}
    </div>
  );
}
