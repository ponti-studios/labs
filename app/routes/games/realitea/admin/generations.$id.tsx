import { SectionIntro } from "@ponti-studios/ui/layout";
import { Button, StatusBadge, type StatusBadgeConfig } from "@ponti-studios/ui/primitives";
import {
  Link,
  redirect,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import { getRealiteaAdminActor } from "~/lib/realitea/admin/auth";
import { formatTokenCount, formatUsd } from "~/lib/realitea/admin/format";
import { loadAdminGeneration, resolveAdminGame } from "~/lib/realitea/admin/inventory";
import { publishCandidate } from "~/lib/realitea/admin/publish";
import { DEFAULT_REALITEA_GAME_SLUG } from "~/lib/realitea/generation/catalog";
import { assertSameOrigin } from "~/lib/server/origin";

import { CandidateCards } from "./components/candidate-cards";

import "../realitea.css";

const GENERATION_STATUS: Record<"running" | "succeeded" | "failed", StatusBadgeConfig> = {
  running: { label: "Running", variant: "outline" },
  succeeded: { label: "Succeeded", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
};

export function meta() {
  return [{ title: "RealiTea generation" }, { name: "robots", content: "noindex" }];
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const generationId = Number.parseInt(params.id ?? "", 10);
  if (!Number.isInteger(generationId) || generationId < 1) {
    throw Response.json({ error: "Invalid generation" }, { status: 400 });
  }

  const slug = new URL(request.url).searchParams.get("game") ?? DEFAULT_REALITEA_GAME_SLUG;
  const detail = await loadAdminGeneration(slug, generationId);
  if (!detail) throw Response.json({ error: "Generation not found" }, { status: 404 });
  return detail;
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const originDenied = assertSameOrigin(request);
  if (originDenied) return originDenied;

  const auth = getRealiteaAdminActor(context);
  const generationId = Number.parseInt(params.id ?? "", 10);
  const form = await request.formData();
  const candidateId = Number.parseInt(String(form.get("candidateId") ?? ""), 10);
  if (!Number.isInteger(generationId) || !Number.isInteger(candidateId)) {
    return Response.json({ ok: false as const, error: "Invalid publish request" }, { status: 400 });
  }

  const slug = new URL(request.url).searchParams.get("game") ?? DEFAULT_REALITEA_GAME_SLUG;
  const game = await resolveAdminGame(slug);
  if (!game)
    return Response.json({ ok: false as const, error: "Topic not found" }, { status: 404 });

  const result = await publishCandidate({
    game,
    generationId,
    candidateId,
    userId: auth.userId,
  });
  if (!result.ok) {
    return Response.json({ ok: false as const, error: result.error }, { status: 400 });
  }
  return redirect(`/games/realitea/admin/dates/${result.dateKey}?game=${game.slug}`);
}

export default function RealiTeaAdminGeneration() {
  const { game, generation } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to={`/games/realitea/admin?game=${game.slug}`}>← Admin</Link>
      </Button>

      <SectionIntro
        eyebrow={game.name}
        title={`Generation ${generation.id}`}
        description={`${generation.dateKey} · ${generation.sourceMode} · ${generation.model}`}
        actions={<StatusBadge status={generation.status} config={GENERATION_STATUS} />}
      />

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Max tokens</dt>
          <dd>{generation.requestedMaxTokens ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Reasoning effort</dt>
          <dd>{generation.reasoningEffort ?? "default"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tokens (prompt / completion / reasoning)</dt>
          <dd>
            {formatTokenCount(generation.promptTokens)} / {formatTokenCount(generation.completionTokens)} /{" "}
            {formatTokenCount(generation.reasoningTokens)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Cost</dt>
          <dd>{formatUsd(generation.costUsd)}</dd>
        </div>
      </dl>

      <CandidateCards
        candidates={generation.candidates}
        generationId={generation.id}
        gameSlug={game.slug}
        publishable={generation.publishable}
      />
    </main>
  );
}
