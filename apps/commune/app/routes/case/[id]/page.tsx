import type { RelationshipVerdict } from "@pontistudios/db";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { COLOR_THEMES } from "~/components/verdict/card-theme-picker";
import { PERSONALITY_TYPES } from "~/components/verdict/personality-type-picker";
import { CACHE_TTL, withCache } from "~/lib/server/cache";
import { createVerdict } from "~/lib/server/mutations";
import { getCaseWithStats, getVerdictsByCase } from "~/lib/server/queries";
import { generateFingerprint } from "~/lib/voter.utils";
import { cn } from "~/lib/utils";
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
  const value = formData.get("value") as "stay" | "dump";
  const fingerprint = formData.get("fingerprint") as string;
  const comment = (formData.get("comment") as string) || null;
  if (!value || !fingerprint) return { error: "Missing fields" };
  try {
    const verdict = await createVerdict({ value, fingerprint, userId: null, caseId, comment });
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

  const [localVerdicts, setLocalVerdicts] = useState<RelationshipVerdict[]>(initialVerdicts);
  const [selectedVote, setSelectedVote] = useState<"stay" | "dump" | null>(null);
  const [comment, setComment] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [copied, setCopied] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const owned: string[] = JSON.parse(localStorage.getItem("commune:owned") ?? "[]");
    setIsOwner(owned.includes(caseRecord.id));
    const fp = generateFingerprint();
    setHasVoted(localVerdicts.some((v) => v.fingerprint === fp));
  }, [caseRecord.id, localVerdicts]);

  useEffect(() => {
    if (fetcher.data && "success" in fetcher.data && fetcher.data.success && fetcher.data.verdict) {
      setLocalVerdicts((prev) => [fetcher.data!.verdict as RelationshipVerdict, ...prev]);
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (selectedVote) commentRef.current?.focus();
  }, [selectedVote]);

  const handleVoteSelect = (vote: "stay" | "dump") => {
    if (hasVoted) return;
    setSelectedVote((prev) => (prev === vote ? null : vote));
  };

  const handleSubmit = () => {
    if (!selectedVote || hasVoted) return;
    const fp = generateFingerprint();
    const fd = new FormData();
    fd.append("value", selectedVote);
    fd.append("fingerprint", fp);
    if (comment.trim()) fd.append("comment", comment.trim());
    fetcher.submit(fd, { method: "post" });
    setHasVoted(true);
    setSelectedVote(null);
    setComment("");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/case/${caseRecord.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedTheme = COLOR_THEMES.find((t) => t.value === caseRecord.colorTheme) ?? COLOR_THEMES[0];
  const selectedType = PERSONALITY_TYPES.find((t) => t.value === caseRecord.cardType?.toLowerCase()) ?? PERSONALITY_TYPES[0];

  const vibes = localVerdicts.filter((v) => v.value === "stay").length;
  const icks = localVerdicts.filter((v) => v.value === "dump").length;
  const total = localVerdicts.length;
  const vibePercent = total > 0 ? Math.round((vibes / total) * 100) : 0;

  return (
    <div className="max-w-sm mx-auto py-8 px-4">
      <div className={cn("border-[8px] rounded-2xl overflow-hidden shadow-xl", selectedTheme.border)}>

        {/* Card header */}
        <div className="flex justify-between items-center px-4 pt-3 pb-1">
          <h1 className="font-bold text-xl">{caseRecord.name}</h1>
          <span className="text-red-600 font-bold text-sm">HP {caseRecord.hp ?? "—"}</span>
        </div>

        {/* Type badge */}
        <div className="flex justify-end px-4 pb-2">
          <span className={cn("text-white text-[9px] font-semibold px-2 py-0.5 rounded", selectedType.color)}>
            {selectedType.label}
          </span>
        </div>

        {/* Photo */}
        <div className="mx-3 rounded-lg overflow-hidden border-2 border-gray-300" style={{ height: 220 }}>
          {caseRecord.photoUrl ? (
            <div
              style={{
                width: "100%", height: "100%",
                backgroundImage: `url(${caseRecord.photoUrl})`,
                backgroundSize: "cover", backgroundPosition: "center",
                transform: `scale(${caseRecord.imageScale ?? 1}) translate(${(caseRecord.imagePosition?.x ?? 0) / (caseRecord.imageScale ?? 1)}px, ${(caseRecord.imagePosition?.y ?? 0) / (caseRecord.imageScale ?? 1)}px)`,
                transformOrigin: "center center",
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Sparkles className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Description */}
        {caseRecord.description && (
          <p className="px-4 pt-2 pb-1 text-xs italic text-muted-foreground">{caseRecord.description}</p>
        )}

        {/* Attacks */}
        {caseRecord.attacks?.length > 0 && (
          <div className="px-4 py-2 flex flex-col gap-1">
            {caseRecord.attacks.map((attack, i) => (
              <div
                key={`attack-${i}`}
                className={cn("flex justify-between text-xs", i < caseRecord.attacks.length - 1 && "border-b border-gray-300/60 pb-1")}
              >
                <span className="font-semibold">{attack.name}</span>
                <span className="font-bold text-red-600">{attack.damage}</span>
              </div>
            ))}
          </div>
        )}

        {/* Flaws / Strengths / Commitment */}
        <div className="px-4 py-2 border-t border-gray-200 text-[10px] text-muted-foreground space-y-1">
          {caseRecord.flaws?.length > 0 && (
            <p><span className="font-semibold text-foreground">Flaws:</span> {caseRecord.flaws.join(", ")}</p>
          )}
          {caseRecord.strengths?.length > 0 && (
            <p><span className="font-semibold text-foreground">Strengths:</span> {caseRecord.strengths.join(", ")}</p>
          )}
          <div className="flex justify-between items-center">
            <p>
              <span className="font-semibold text-foreground">Commitment:</span>{" "}
              {"★".repeat(Number(caseRecord.commitmentLevel ?? 0))}
            </p>
            <span>001/100</span>
          </div>
        </div>

        {/* Extension panel */}
        <div className="bg-muted border-t-2 border-border">

          {/* Jury results */}
          {total > 0 && (
            <div className="px-4 pt-4 pb-3 border-b border-border">
              <p className="text-[9px] font-semibold uppercase tracking-widest mb-2 text-muted-foreground">
                The jury's out
              </p>
              <div className="flex rounded-full overflow-hidden h-2 mb-2">
                <div className="bg-green-500" style={{ flex: vibePercent }} />
                <div className="bg-red-500" style={{ flex: 100 - vibePercent }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-600 font-semibold">{vibePercent}% vibe · {vibes}</span>
                <span className="text-red-500 font-semibold">{icks} ick{icks !== 1 ? "s" : ""}</span>
              </div>
            </div>
          )}

          {/* Owner: share CTA */}
          {isOwner && (
            <div className="px-4 pt-4 pb-3 border-b border-border">
              <button
                type="button"
                onClick={handleShare}
                className="w-full bg-foreground text-background rounded-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                </svg>
                {copied ? "Link copied!" : "Share with friends"}
              </button>
            </div>
          )}

          {/* Takes list */}
          <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
            {total > 0 && (
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Takes ({total})
              </p>
            )}

            {total === 0 && !isOwner && (
              <p className="text-[10px] text-muted-foreground">Be the first to weigh in.</p>
            )}

            {total === 0 && isOwner && (
              <p className="text-[10px] text-muted-foreground">No takes yet — share the link to get your friends' opinions.</p>
            )}

            {localVerdicts.map((v) => (
              <div key={v.id} className="flex gap-2 items-start">
                <span className={cn(
                  "text-[10px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap flex-shrink-0",
                  v.value === "stay"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600",
                )}>
                  {v.value === "stay" ? "Vibe" : "Ick"}
                </span>
                <div>
                  {v.comment ? (
                    <p className="text-xs text-foreground mb-0.5">"{v.comment}"</p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic mb-0.5">No comment</p>
                  )}
                  <p className="text-[9px] text-muted-foreground">{timeAgo(v.createdAt)}</p>
                </div>
              </div>
            ))}

            {/* Friend: vote form */}
            {!isOwner && (
              !hasVoted ? (
                <div className="pt-2 flex flex-col gap-2 border-t border-border">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleVoteSelect("stay")}
                      className={cn(
                        "flex-1 py-2 rounded-full text-xs font-bold transition-all",
                        selectedVote === "stay"
                          ? "border-2 border-green-500 bg-green-50 text-green-700"
                          : selectedVote === "dump"
                            ? "border border-green-200 text-green-400 opacity-50"
                            : "border border-green-400 text-green-600",
                      )}
                    >
                      ✓ Vibe
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVoteSelect("dump")}
                      className={cn(
                        "flex-1 py-2 rounded-full text-xs font-bold transition-all",
                        selectedVote === "dump"
                          ? "border-2 border-red-500 bg-red-50 text-red-600"
                          : selectedVote === "stay"
                            ? "border border-red-200 text-red-400 opacity-50"
                            : "border border-red-400 text-red-500",
                      )}
                    >
                      ✕ Ick
                    </button>
                  </div>

                  {selectedVote && (
                    <>
                      <textarea
                        ref={commentRef}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Say something... (optional)"
                        rows={2}
                        className="w-full text-xs border border-input rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                      />
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={fetcher.state === "submitting"}
                        className={cn(
                          "w-full py-2 rounded-full text-xs font-semibold text-white transition-opacity disabled:opacity-60",
                          selectedVote === "stay" ? "bg-green-600" : "bg-red-600",
                        )}
                      >
                        {fetcher.state === "submitting"
                          ? "Submitting..."
                          : `Submit ${selectedVote === "stay" ? "vibe" : "ick"}`}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground italic pt-2 border-t border-border">
                  You've already weighed in.
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
