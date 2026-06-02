import type { RelationshipVerdict } from "@pontistudios/db";
import { Button, Progress } from "@pontistudios/ui";
import { MessageSquare, Share2, Users } from "lucide-react";
import { useState } from "react";
import { useLoaderData } from "react-router";
import { AddRatingDialog } from "~/components/verdict/add-rating-dialog";
import { ShareDialog } from "~/components/verdict/share-dialog";
import { CACHE_TTL, withCache } from "~/lib/server/cache";
import { getCaseWithStats, getVerdictsByCase } from "~/lib/server/queries";
import { generateFingerprint } from "~/lib/voter.utils";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/page";

interface LoaderData {
  caseRecord: {
    id: string;
    name: string;
    photoUrl: string | null;
    voteStats: { total: number; stay: number; dump: number; stayPercentage: number };
  } | null;
  verdicts: RelationshipVerdict[];
}

export async function loader({ params }: Route.LoaderArgs) {
  const caseId = params.id;

  const [caseRecord, verdicts] = await Promise.all([
    withCache(`case:${caseId}`, () => getCaseWithStats(caseId), CACHE_TTL.CASE_DETAIL),
    getVerdictsByCase(caseId),
  ]);

  if (!caseRecord) return { caseRecord: null, verdicts: [] };

  return {
    caseRecord: {
      id: caseRecord.id,
      name: caseRecord.name,
      photoUrl: caseRecord.photoUrl,
      voteStats: caseRecord.voteStats,
    },
    verdicts,
  };
}

export function CaseDetailPage() {
  const { caseRecord, verdicts } = useLoaderData<LoaderData>();

  if (!caseRecord) {
    return <div className="text-center py-10">Case not found</div>;
  }

  const cardName = caseRecord.name || "Partner";
  const { voteStats } = caseRecord;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/case/${caseRecord.id}`
      : `/case/${caseRecord.id}`;

  const [localVerdicts, setLocalVerdicts] = useState<RelationshipVerdict[]>(verdicts);
  const [newRating, setNewRating] = useState({ verdict: "" as "stay" | "dump" | "", comment: "" });
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const localStayCount = localVerdicts.filter((v) => v.value === "stay").length;
  const localDumpCount = localVerdicts.filter((v) => v.value === "dump").length;
  const localTotal = localVerdicts.length;
  const localStayPercentage = localTotal > 0 ? Math.round((localStayCount / localTotal) * 100) : 0;

  const displayStayCount = localVerdicts.length > verdicts.length ? localStayCount : voteStats.stay;
  const displayDumpCount = localVerdicts.length > verdicts.length ? localDumpCount : voteStats.dump;
  const displayTotal = localVerdicts.length > verdicts.length ? localTotal : voteStats.total;
  const displayStayPercentage =
    localVerdicts.length > verdicts.length ? localStayPercentage : voteStats.stayPercentage;

  const handleNewRatingChange = (field: string, value: string) => {
    setNewRating((prev) => ({ ...prev, [field]: value }));
  };

  const submitRating = async () => {
    if (!newRating.verdict) return;

    const fingerprint = generateFingerprint();

    const optimisticVerdict: RelationshipVerdict = {
      id: `temp-${Date.now()}`,
      caseId: caseRecord.id,
      userId: null,
      fingerprint,
      value: newRating.verdict,
      comment: newRating.comment || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setLocalVerdicts([optimisticVerdict, ...localVerdicts]);
    setNewRating({ verdict: "", comment: "" });
    setRatingDialogOpen(false);

    try {
      const formData = new FormData();
      formData.append("value", newRating.verdict);
      formData.append("fingerprint", fingerprint);
      formData.append("comment", newRating.comment);

      const response = await fetch(`/case/${caseRecord.id}/verdict`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) window.location.reload();
    } catch (error) {
      console.error("Failed to submit verdict:", error);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "stay":
        return "bg-green-100 text-green-800 border-green-200";
      case "dump":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{cardName.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{cardName}</h1>
                <p className="text-sm text-gray-500">Verdict Results</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareDialogOpen(true)}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              Community Verdict
            </h2>
            <span className="text-2xl font-bold text-gray-900">{displayTotal} verdicts</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-700 font-medium">Stay</span>
                <span className="text-green-700 font-medium">{displayStayPercentage}%</span>
              </div>
              <Progress value={displayStayPercentage} className="h-3 bg-gray-200" />
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">{displayStayCount} say stay</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">{displayDumpCount} say dump</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <Button size="lg" onClick={() => setRatingDialogOpen(true)} className="gap-2">
            <MessageSquare className="w-5 h-5" />
            Add Your Verdict
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Verdicts</h3>
          {localVerdicts.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </p>
                  {v.comment && (
                    <p className="text-gray-700 mt-2 leading-relaxed">&ldquo;{v.comment}&rdquo;</p>
                  )}
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium border ml-4",
                    getVerdictColor(v.value),
                  )}
                >
                  {v.value === "stay" ? "Stay" : "Dump"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {localVerdicts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No verdicts yet</h3>
            <p className="text-gray-500 mb-4">Be the first to share your verdict!</p>
            <Button onClick={() => setRatingDialogOpen(true)}>Add Verdict</Button>
          </div>
        )}
      </div>

      <AddRatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        newRating={newRating}
        handleNewRatingChange={handleNewRatingChange}
        submitRating={submitRating}
      />
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        cardName={cardName}
        shareUrl={shareUrl}
        copyShareLink={copyShareLink}
      />
    </div>
  );
}
