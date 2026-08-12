import { Button } from "@ponti-studios/ui/primitives";
import { SectionIntro } from "@ponti-studios/ui/layout";
import { useState } from "react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";

import {
  GENERATION_PROMPT_FILES,
  studioModelAllowlist,
  type GenerateErr,
  type GenerateOk,
  type GenerateProgressEvent,
} from "~/lib/realitea/admin/generate";
import { resolveAdminGame } from "~/lib/realitea/admin/inventory";
import { getDateKey } from "~/lib/realitea/date";
import { MAX_FEED_TITLE_LENGTH, sanitizeFeedText } from "~/lib/realitea/feed-text";
import { PROMPT_TEST_FIXTURES } from "~/lib/realitea/fixtures/prompt-test-fixtures";
import { getActiveGames, getPendingArticlesForGame } from "~/lib/realitea/repository";

import { GenerateForm } from "./components/generate-form";
import { GenerateProgress } from "./components/generate-progress";
import { GenerateResult } from "./components/generate-result";
import { readGenerateStream } from "./components/generate-stream";

import "../realitea.css";

const DEFAULT_GAME = "rhobh";

export function meta() {
  return [{ title: "RealiTea generate" }, { name: "robots", content: "noindex" }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const slug = new URL(request.url).searchParams.get("game") ?? DEFAULT_GAME;
  const game = await resolveAdminGame(slug);
  if (!game) throw Response.json({ error: "No active RealiTea topic found" }, { status: 404 });
  const [topics, pendingArticles] = await Promise.all([
    getActiveGames(),
    getPendingArticlesForGame(game, 50),
  ]);

  return {
    game: { id: game.id, slug: game.slug, name: game.name },
    dateKey: getDateKey(new Date()),
    models: studioModelAllowlist(),
    promptFiles: GENERATION_PROMPT_FILES,
    topics: topics.map((topic) => ({ id: topic.id, slug: topic.slug, name: topic.name })),
    articles: pendingArticles.map((article) => ({
      id: article.id,
      title: sanitizeFeedText(article.title, MAX_FEED_TITLE_LENGTH),
    })),
    fixtures: PROMPT_TEST_FIXTURES.map((fixture) => fixture.id),
  };
}

export default function RealiTeaAdminGenerate() {
  const data = useLoaderData<typeof loader>();
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<GenerateProgressEvent | null>(null);
  const [result, setResult] = useState<GenerateOk | GenerateErr | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setRunning(true);
    setResult(null);
    setStage({
      type: "stage",
      stage: "prepare",
      label: "Checking the request",
      detail: "Sending the generation to the server.",
    });

    try {
      const response = await fetch("/games/realitea/admin/generate/events", {
        method: "POST",
        body: form,
        credentials: "same-origin",
        headers: { Accept: "application/x-ndjson" },
      });
      if (!response.ok || !response.body) {
        setResult({
          ok: false,
          code: "INVALID_SOURCE",
          error: `Generation failed (${response.status})`,
        });
        return;
      }
      await readGenerateStream(response.body, setStage, setResult);
    } catch (error) {
      setResult({
        ok: false,
        code: "INVALID_SOURCE",
        error: error instanceof Error ? error.message : "Generation failed",
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to={`/games/realitea/admin?game=${data.game.slug}`}>← Inventory</Link>
      </Button>

      <SectionIntro
        eyebrow={data.game.name}
        title="Generate"
        description="Ask the model for candidate words for one date. This does not publish a puzzle."
      />

      <GenerateForm
        data={{
          gameSlug: data.game.slug,
          dateKey: data.dateKey,
          models: data.models,
          promptFiles: data.promptFiles,
          topics: data.topics,
          articles: data.articles,
          fixtures: data.fixtures,
        }}
        running={running}
        onSubmit={onSubmit}
      />

      <GenerateProgress running={running} failed={result?.ok === false} stage={stage} />

      {result ? <GenerateResult result={result} gameSlug={data.game.slug} /> : null}
    </main>
  );
}
