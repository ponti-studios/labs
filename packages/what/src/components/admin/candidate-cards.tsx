import { EmptyState } from "@ponti-studios/ui/feedback";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@ponti-studios/ui/primitives";
import { Link2, LucideCheck } from "lucide-react";
import { useFetcher } from "react-router";

import { explainGenerateReason } from "~/lib/game/admin/generate-copy";
import type { AdminGenerationCandidate } from "~/lib/game/admin/inventory";
import { GameTile } from "~/components/game/game-tile";

import styles from "./candidate-cards.module.css";

type PublishActionData = { ok: false; error: string };

export function CandidateCards({
  candidates,
  generationId,
  gameSlug,
  publishable,
}: {
  candidates: AdminGenerationCandidate[];
  generationId: number;
  gameSlug: string;
  publishable: boolean;
}) {
  if (candidates.length === 0) {
    return (
      <EmptyState
        title="No answers stored"
        description="This generation finished without scored candidates."
      />
    );
  }

  return (
    <section className={styles.list}>
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          generationId={generationId}
          gameSlug={gameSlug}
          publishable={publishable}
        />
      ))}
    </section>
  );
}

function CandidateCard({
  candidate,
  generationId,
  gameSlug,
  publishable,
}: {
  candidate: AdminGenerationCandidate;
  generationId: number;
  gameSlug: string;
  publishable: boolean;
}) {
  const fetcher = useFetcher<PublishActionData>();
  const canPublish = publishable && candidate.valid && candidate.articleId !== null;
  const busy = fetcher.state !== "idle";
  const error = fetcher.data?.error;

  return (
    <Card>
      <CardHeader>
        <CardTitle className={styles.header}>
          <div
            className={styles.answer}
            aria-label={`Proposed answer ${candidate.candidate.answer.toUpperCase()}`}
            role="img"
          >
            {candidate.candidate.answer
              .toUpperCase()
              .split("")
              .map((letter, index) => (
                <GameTile key={`${letter}-${index}`} state="correct" letter={letter} />
              ))}
          </div>

          {candidate.articleUrl ? (
            <Button asChild variant="outline">
              <a
                href={candidate.articleUrl}
                className="text-primary underline-offset-4 hover:underline"
              >
                <Link2 className="size-4" />
              </a>
            </Button>
          ) : (
            <span className="text-muted-foreground">No matching story</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 pt-0 text-sm">
        <div>
          <p className="text-lg tracking-[0.12em]">Clue</p>
          <p>{candidate.candidate.clue}</p>
        </div>
        <div>
          <p className="text-lg tracking-[0.12em]">Detail</p>
          <p>{candidate.candidate.detail}</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <div>
            {candidate.reasons.length > 0 ? (
              <ul className="text-muted-foreground list-disc pl-4">
                {candidate.reasons.map((reason) => (
                  <li key={reason}>{explainGenerateReason(reason)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground flex items-center gap-2">
                <LucideCheck className="text-success size-4" />
                Passed checks.
              </p>
            )}
            {!canPublish ? (
              <p className="text-muted-foreground text-xs">
                {!publishable
                  ? "Review only — ingest the story before publishing."
                  : "This draft did not pass the publish checks."}
              </p>
            ) : null}
          </div>
          <fetcher.Form
            method="post"
            action={`/admin/generations/${generationId}?game=${gameSlug}`}
          >
            <input type="hidden" name="candidateId" value={candidate.id} />
            <Button type="submit" className="w-fit" disabled={!canPublish || busy} isLoading={busy}>
              Publish
            </Button>
          </fetcher.Form>
        </div>
        {error ? <p className="text-destructive text-xs">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
