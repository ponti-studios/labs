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
      <div className="mx-auto max-w-2xl px-4 py-10">
        <button
          type="button"
          onClick={() => setStage("write")}
          className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 text-xs transition-colors"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-base font-semibold">Review before filing</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            This is what your jury will see — not your original words.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                What you wrote
              </p>
              <div className="border-border bg-muted/30 text-muted-foreground min-h-[140px] rounded-xl border p-4 text-xs leading-relaxed">
                {rawSituation}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-foreground text-[10px] font-semibold tracking-widest uppercase">
                What your jury sees
              </p>
              <div className="border-foreground/20 bg-background min-h-[140px] rounded-xl border p-4 text-xs leading-relaxed">
                {neutralSituation}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
              The question your jury will answer
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              className="border-input bg-background focus:ring-ring w-full resize-none rounded-xl border px-4 py-3 text-sm focus:ring-1 focus:outline-none"
            />
            <p className="text-muted-foreground text-[10px]">
              You can edit this if it's not quite right.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
              Label — optional
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. The 2am text situation"
              className="border-input bg-background focus:ring-ring placeholder:text-muted-foreground w-full rounded-xl border px-4 py-3 text-sm focus:ring-1 focus:outline-none"
            />
            <p className="text-muted-foreground text-[10px]">
              A short name for your docket. Only you see this.
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleFile}
            disabled={isLoading || !question.trim()}
            className="bg-foreground text-background w-full rounded-full py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isLoading ? "Filing…" : "File this case"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-base font-semibold">File a case</h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Write what happened in your own words. Your jury will see a neutral version — not this.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
            What happened?
          </label>
          <textarea
            value={rawSituation}
            onChange={(e) => setRawSituation(e.target.value)}
            placeholder="Write it like you're texting a close friend. Don't filter yourself — your jury won't see this version."
            rows={8}
            autoFocus
            className="border-input bg-background focus:ring-ring placeholder:text-muted-foreground w-full resize-none rounded-xl border px-4 py-3 text-sm leading-relaxed focus:ring-1 focus:outline-none"
          />
        </div>

        {clarifications && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="mb-2 text-xs font-medium text-amber-800">
              A bit more detail would help the jury evaluate this. Try adding:
            </p>
            <ul className="flex flex-col gap-1">
              {clarifications.map((c) => (
                <li key={c} className="text-xs text-amber-700">
                  • {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
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
