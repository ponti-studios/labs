import { Alert, AlertDescription, AlertTitle } from "@ponti-studios/ui/feedback";

import type { GenerateErr, GenerateOk } from "~/lib/realitea/admin/generate";

import { CandidateCards } from "./candidate-cards";
import styles from "./generate-result.module.css";

export function GenerateResult({
  result,
  gameSlug,
}: {
  result: GenerateOk | GenerateErr;
  gameSlug: string;
}) {
  if (result.ok === false) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn’t finish this generation</AlertTitle>
        <AlertDescription>{result.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <CandidateCards
          candidates={result.candidates}
          generationId={result.generationId}
          gameSlug={gameSlug}
          publishable={result.publishable}
        />
      </div>
    </section>
  );
}
