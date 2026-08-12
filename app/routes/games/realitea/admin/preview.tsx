import { Alert, AlertDescription, AlertTitle, Progress, Spinner } from "@ponti-studios/ui/feedback";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@ponti-studios/ui/forms";
import { SectionIntro } from "@ponti-studios/ui/layout";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  StatusBadge,
  type StatusBadgeConfig,
} from "@ponti-studios/ui/primitives";
import { useState } from "react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";

import { requireRealiteaAdmin } from "~/lib/realitea/admin/auth";
import { resolveAdminGame } from "~/lib/realitea/admin/inventory";
import { explainPreviewReason, previewStagePercent } from "~/lib/realitea/admin/preview-copy";
import {
  PREVIEW_PROMPT_FILES,
  studioModelAllowlist,
  type PreviewErr,
  type PreviewOk,
  type PreviewProgressEvent,
  type PreviewSourceMode,
} from "~/lib/realitea/admin/preview";
import { getDateKey } from "~/lib/realitea/date";
import { PROMPT_TEST_FIXTURES } from "~/lib/realitea/fixtures/prompt-test-fixtures";
import { getActiveGames } from "~/lib/realitea/repository";

import "../realitea.css";

const DEFAULT_GAME = "rhobh";

const CANDIDATE_STATUS: Record<"valid" | "invalid", StatusBadgeConfig> = {
  valid: { label: "Can become today’s puzzle", variant: "default" },
  invalid: { label: "Can’t publish", variant: "destructive" },
};

const STEPS = [
  { stage: "prepare", label: "Check the request" },
  { stage: "articles", label: "Gather stories" },
  { stage: "model", label: "Ask the model" },
  { stage: "score", label: "Check each word" },
  { stage: "done", label: "Ready to review" },
] as const;

export function meta() {
  return [{ title: "RealiTea preview" }, { name: "robots", content: "noindex" }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireRealiteaAdmin(request, "loader");

  const slug = new URL(request.url).searchParams.get("game") ?? DEFAULT_GAME;
  const game = await resolveAdminGame(slug);
  if (!game) throw Response.json({ error: "No active RealiTea topic found" }, { status: 404 });
  const topics = await getActiveGames();

  return {
    game: { id: game.id, slug: game.slug, name: game.name },
    dateKey: getDateKey(new Date()),
    models: studioModelAllowlist(),
    promptFiles: PREVIEW_PROMPT_FILES,
    topics: topics.map((topic) => ({ id: topic.id, slug: topic.slug, name: topic.name })),
    fixtures: PROMPT_TEST_FIXTURES.map((fixture) => fixture.id),
  };
}

function NamedSelect({
  name,
  label,
  defaultValue,
  items,
  onValueChange,
}: {
  name: string;
  label: string;
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  onValueChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <input type="hidden" name={name} value={value} />
      <Select
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onValueChange?.(next);
        }}
      >
        <SelectTrigger id={name} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function stepState(current: string, stage: string): "todo" | "current" | "done" {
  const order = STEPS.map((step) => step.stage);
  const currentIndex = order.indexOf(current as (typeof STEPS)[number]["stage"]);
  const stageIndex = order.indexOf(stage as (typeof STEPS)[number]["stage"]);
  if (currentIndex === -1) return "todo";
  if (stageIndex < currentIndex) return "done";
  if (stageIndex === currentIndex) return "current";
  return "todo";
}

export default function RealiTeaAdminPreview() {
  const data = useLoaderData<typeof loader>();
  const [sourceMode, setSourceMode] = useState<PreviewSourceMode>("inventory");
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<PreviewProgressEvent | null>(null);
  const [result, setResult] = useState<PreviewOk | PreviewErr | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setRunning(true);
    setResult(null);
    setStage({
      type: "stage",
      stage: "prepare",
      label: "Checking the request",
      detail: "Sending the preview to the server.",
    });

    try {
      const response = await fetch("/games/realitea/admin/preview/events", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });
      if (!response.ok || !response.body) {
        setResult({ ok: false, code: "INVALID_SOURCE", error: `Preview failed (${response.status})` });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const eventPayload = JSON.parse(line) as
            | PreviewProgressEvent
            | { type: "result"; result: PreviewOk | PreviewErr };
          if (eventPayload.type === "stage") setStage(eventPayload);
          if (eventPayload.type === "result") setResult(eventPayload.result);
        }
      }
    } catch (error) {
      setResult({
        ok: false,
        code: "INVALID_SOURCE",
        error: error instanceof Error ? error.message : "Preview failed",
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="realitea-preview mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to={`/games/realitea/admin?game=${data.game.slug}`}>← Inventory</Link>
      </Button>

      <SectionIntro
        eyebrow={data.game.name}
        title="Try a puzzle"
        description="This asks the model for a few five-letter words from today’s stories. Nothing is published until you choose one later."
      />

      <Card>
        <CardHeader>
          <CardTitle>What should we try?</CardTitle>
          <CardDescription>
            Pick the stories and the prompt. Then wait while the model invents answers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <input type="hidden" name="game" value={data.game.slug} />
            <div className="grid gap-2">
              <Label htmlFor="dateKey">Puzzle date</Label>
              <Input id="dateKey" name="dateKey" defaultValue={data.dateKey} />
              <p className="text-muted-foreground text-xs">
                The calendar day this draft is aimed at. It does not replace that day’s live puzzle.
              </p>
            </div>
            <NamedSelect
              name="sourceMode"
              label="Where should the stories come from?"
              defaultValue="inventory"
              onValueChange={(value) => setSourceMode(value as PreviewSourceMode)}
              items={[
                { value: "inventory", label: "This topic’s unused articles" },
                { value: "feeds", label: "Specific topic IDs" },
                { value: "articles", label: "Specific article IDs" },
                { value: "rss", label: "A live RSS feed (review only)" },
                { value: "fixtures", label: "A saved test fixture (review only)" },
              ]}
            />
            {sourceMode === "feeds" ? (
              <div className="grid gap-2">
                <Label htmlFor="feedIds">Topic IDs</Label>
                <Input
                  id="feedIds"
                  name="feedIds"
                  placeholder={data.topics.map((topic) => `${topic.id}:${topic.slug}`).join(", ")}
                />
              </div>
            ) : null}
            {sourceMode === "articles" ? (
              <div className="grid gap-2">
                <Label htmlFor="articleIds">Article IDs</Label>
                <Input id="articleIds" name="articleIds" />
              </div>
            ) : null}
            {sourceMode === "rss" ? (
              <div className="grid gap-2">
                <Label htmlFor="feedUrl">RSS URL</Label>
                <Input id="feedUrl" name="feedUrl" placeholder="https://" />
                <p className="text-muted-foreground text-xs">
                  Review only. Ingest the story before it can become a published puzzle.
                </p>
              </div>
            ) : null}
            {sourceMode === "fixtures" ? (
              <NamedSelect
                name="fixtureId"
                label="Saved fixture"
                defaultValue="none"
                items={[
                  { value: "none", label: "Choose a fixture" },
                  ...data.fixtures.map((id) => ({ value: id, label: id })),
                ]}
              />
            ) : null}
            <NamedSelect
              name="promptSource"
              label="Prompt"
              defaultValue="file"
              items={[
                { value: "file", label: "Use a prompt file" },
                { value: "paste", label: "Paste a one-off prompt" },
              ]}
            />
            <NamedSelect
              name="promptPath"
              label="Prompt file"
              defaultValue={data.promptFiles[0] ?? ""}
              items={data.promptFiles.map((path) => ({
                value: path,
                label: path.replace("app/lib/prompts/", ""),
              }))}
            />
            <div className="grid gap-2">
              <Label htmlFor="promptText">Pasted prompt</Label>
              <Textarea id="promptText" name="promptText" rows={5} className="font-mono" />
            </div>
            <NamedSelect
              name="model"
              label="Model"
              defaultValue={data.models[0] ?? ""}
              items={data.models.map((model) => ({ value: model, label: model }))}
            />
            <Button type="submit" className="w-fit" isLoading={running} disabled={running}>
              {running ? "Generating" : "Generate drafts"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {running || stage ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {running ? <Spinner size="sm" label={false} /> : null}
              {running ? "Working" : "Last run"}
            </CardTitle>
            <CardDescription>{stage?.detail ?? "Waiting for the first update."}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Progress
              value={previewStagePercent(stage?.stage ?? "prepare")}
              className="realitea-preview-progress"
            />
            <ol className="grid gap-2">
              {STEPS.map((step) => {
                const state = stepState(stage?.stage ?? "prepare", step.stage);
                return (
                  <li
                    key={step.stage}
                    className="realitea-preview-step text-sm"
                    data-state={state}
                  >
                    <span className="font-medium">{step.label}</span>
                    {state === "current" && stage ? (
                      <span className="text-muted-foreground"> — {stage.detail}</span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      ) : null}

      {result && result.ok === false ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn’t finish this preview</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      ) : null}

      {result && result.ok === true ? (
        <section className="flex flex-col gap-3">
          <Alert>
            <AlertTitle>
              {result.candidates.filter((candidate) => candidate.valid).length} of{" "}
              {result.candidates.length} drafts could become a puzzle
            </AlertTitle>
            <AlertDescription>
              {result.articleCount} stor{result.articleCount === 1 ? "y" : "ies"} · {result.model}
              {result.publishable
                ? " · A valid draft can be published later."
                : " · Review only — ingest the story before publishing."}
              {result.llmError ? ` · Model: ${result.llmError}` : ""}
              {result.feedError ? ` · Feed: ${result.feedError}` : ""}
            </AlertDescription>
          </Alert>
          {result.candidates.map((candidate) => (
            <Card key={candidate.id} className="realitea-preview-card">
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-xs tracking-[0.12em] uppercase">
                    Proposed answer
                  </p>
                  <CardTitle className="font-mono tracking-[0.18em]">
                    {candidate.candidate.answer.toUpperCase()}
                  </CardTitle>
                </div>
                <StatusBadge
                  status={candidate.valid ? "valid" : "invalid"}
                  config={CANDIDATE_STATUS}
                />
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs tracking-[0.12em] uppercase">
                    Clue players see
                  </p>
                  <p>{candidate.candidate.clue}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs tracking-[0.12em] uppercase">
                    Extra detail after they finish
                  </p>
                  <p>{candidate.candidate.detail}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{candidate.candidate.answerType}</Badge>
                  {candidate.articleUrl ? (
                    <a
                      href={candidate.articleUrl}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {candidate.articleTitle ?? candidate.articleUrl}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">No matching story</span>
                  )}
                </div>
                {candidate.reasons.length > 0 ? (
                  <ul className="text-muted-foreground list-disc pl-4">
                    {candidate.reasons.map((reason) => (
                      <li key={reason}>{explainPreviewReason(reason)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    Passed the five-letter, dictionary, leak, and source checks.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}
    </main>
  );
}
