import { useEffect, useState } from "react";
import { useFetcher, useNavigate } from "react-router";
import { neutralizeSituation } from "~/lib/server/neutralize";
import { createCase } from "~/lib/server/mutations";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/create";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "neutralize") {
    const rawSituation = formData.get("rawSituation") as string;
    if (!rawSituation?.trim()) return { error: "Please describe the situation first." };
    const result = await neutralizeSituation(rawSituation.trim());
    return { neutralized: result };
  }

  if (intent === "file") {
    const rawSituation = formData.get("rawSituation") as string;
    const neutralSituation = formData.get("neutralSituation") as string;
    const question = formData.get("question") as string;
    const label = (formData.get("label") as string) || null;
    const caseRecord = await createCase({
      rawSituation,
      neutralSituation,
      question,
      label,
      quorumSize: 3,
      userId: null,
    });
    return { filed: true, caseId: caseRecord.id };
  }

  return { error: "Unknown intent" };
}

type Stage = "write" | "review";

export default function CreatePage() {
  const navigate = useNavigate();
  const fetcher = useFetcher<typeof action>();
  const [stage, setStage] = useState<Stage>("write");
  const [rawSituation, setRawSituation] = useState("");
  const [label, setLabel] = useState("");
  const [neutralSituation, setNeutralSituation] = useState("");
  const [question, setQuestion] = useState("");

  const isLoading = fetcher.state !== "idle";
  const data = fetcher.data;

  useEffect(() => {
    if (!data) return;
    if ("neutralized" in data && data.neutralized) {
      if (data.neutralized.needsClarification) return;
      setNeutralSituation(data.neutralized.neutralSituation);
      setQuestion(data.neutralized.question);
      setStage("review");
    }
    if ("filed" in data && data.filed) {
      const existing = JSON.parse(localStorage.getItem("commune:owned") ?? "[]");
      localStorage.setItem("commune:owned", JSON.stringify([...existing, data.caseId]));
      navigate(`/case/${data.caseId}`);
    }
  }, [data, navigate]);

  const handleNeutralize = () => {
    if (!rawSituation.trim() || isLoading) return;
    const fd = new FormData();
    fd.append("intent", "neutralize");
    fd.append("rawSituation", rawSituation.trim());
    fetcher.submit(fd, { method: "POST" });
  };

  const handleFile = () => {
    if (!question.trim() || isLoading) return;
    const fd = new FormData();
    fd.append("intent", "file");
    fd.append("rawSituation", rawSituation);
    fd.append("neutralSituation", neutralSituation);
    fd.append("question", question);
    if (label.trim()) fd.append("label", label.trim());
    fetcher.submit(fd, { method: "POST" });
  };

  const clarifications =
    data && "neutralized" in data ? data.neutralized?.needsClarification : undefined;
  const error = data && "error" in data ? data.error : undefined;

  if (stage === "review") {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <button
          type="button"
          onClick={() => setStage("write")}
          className="text-xs text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-base font-semibold">Review before filing</h1>
          <p className="text-xs text-muted-foreground mt-1">
            This is what your jury will see — not your original words.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                What you wrote
              </p>
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground leading-relaxed min-h-[140px]">
                {rawSituation}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground">
                What your jury sees
              </p>
              <div className="rounded-xl border border-foreground/20 bg-background p-4 text-xs leading-relaxed min-h-[140px]">
                {neutralSituation}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              The question your jury will answer
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              className="w-full text-sm border border-input rounded-xl px-4 py-3 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-[10px] text-muted-foreground">You can edit this if it's not quite right.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Label — optional
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. The 2am text situation"
              className="w-full text-sm border border-input rounded-xl px-4 py-3 bg-background focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
            />
            <p className="text-[10px] text-muted-foreground">A short name for your docket. Only you see this.</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="button"
            onClick={handleFile}
            disabled={isLoading || !question.trim()}
            className="w-full bg-foreground text-background rounded-full py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {isLoading ? "Filing…" : "File this case"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-base font-semibold">File a case</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Write what happened in your own words. Your jury will see a neutral version — not this.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            What happened?
          </label>
          <textarea
            value={rawSituation}
            onChange={(e) => setRawSituation(e.target.value)}
            placeholder="Write it like you're texting a close friend. Don't filter yourself — your jury won't see this version."
            rows={8}
            autoFocus
            className="w-full text-sm border border-input rounded-xl px-4 py-3 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground leading-relaxed"
          />
        </div>

        {clarifications && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-medium text-amber-800 mb-2">
              A bit more detail would help the jury evaluate this. Try adding:
            </p>
            <ul className="flex flex-col gap-1">
              {clarifications.map((c) => (
                <li key={c} className="text-xs text-amber-700">• {c}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="button"
          onClick={handleNeutralize}
          disabled={isLoading || !rawSituation.trim()}
          className={cn(
            "w-full rounded-full py-3 text-sm font-medium transition-opacity disabled:opacity-40",
            "bg-foreground text-background hover:opacity-90",
          )}
        >
          {isLoading ? "Neutralizing…" : "See what your jury will read →"}
        </button>
      </div>
    </div>
  );
}
