import { Button, Card, CardContent } from "@ponti-studios/ui/primitives";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";

import { isDateKey } from "~/lib/realitea/date";
import { loadPuzzleForSpecificDate, type DatedPuzzleEnvelope } from "~/lib/realitea/puzzle.server";
import { buildHominemLoginUrl, getHominemUser } from "~/lib/server/hominem-auth";

import { RealiTeaGameBoard, RealiTeaGameBoardSkeleton } from "./game-board";
import { resolveReturnTo } from "./return-to.server";

import "./realitea.css";

const DEFAULT_REALITEA_GAME_SLUG = "rhobh";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const dateKey = params.date;
  if (!dateKey || !isDateKey(dateKey)) {
    throw Response.json(
      { code: "REALITEA_INVALID_DATE", error: "Invalid puzzle date" },
      { status: 400, statusText: "Invalid puzzle date" },
    );
  }

  const user = await getHominemUser(request);
  const gameSlug = new URL(request.url).searchParams.get("game") ?? DEFAULT_REALITEA_GAME_SLUG;
  const envelope = gameSlug === DEFAULT_REALITEA_GAME_SLUG
    ? await loadPuzzleForSpecificDate(dateKey, user)
    : await loadPuzzleForSpecificDate(dateKey, user, gameSlug);

  if (!envelope) {
    throw Response.json(
      { code: "REALITEA_PUZZLE_NOT_FOUND", error: "No RealiTea puzzle found for that date" },
      { status: 404, statusText: "No RealiTea puzzle found for that date" },
    );
  }

  const loginUrl = buildHominemLoginUrl(resolveReturnTo(request));

  return Response.json({ ...envelope, signedIn: user !== null, loginUrl, gameSlug });
}

export type LoaderData = DatedPuzzleEnvelope & { signedIn: boolean; loginUrl: string; gameSlug: string };

export function meta({ params }: { params: { date?: string } }) {
  return [
    { title: `RealiTea — ${params.date ?? "Past puzzle"} — Labyrinth` },
    { name: "description", content: "Play or review a past RealiTea puzzle." },
    // Never index individual date pages — they can reveal solved answers.
    { name: "robots", content: "noindex" },
  ];
}

export function HydrateFallback() {
  return <RealiTeaGameBoardSkeleton />;
}

type ErrorBoundaryProps = { error: Error };

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-muted-foreground text-xs tracking-[0.15em] uppercase">
        Something went wrong
      </p>
      <p className="text-muted-foreground text-xs">
        {error.message || "That puzzle couldn't load."}
      </p>
      <Button asChild variant="default" className="mt-2">
        <a href="/games/realitea/history">Back to history</a>
      </Button>
    </div>
  );
}

/**
 * Signed-out visitors get a clue-only teaser, never the interactive board —
 * evaluateGuessServer's anonymous one-free-guess design is meant for
 * "today," not to be exercised against arbitrary historical dates (see
 * loadPuzzleForSpecificDate's doc comment).
 */
function SignedOutTeaser({
  dateKey,
  clue,
  loginUrl,
}: {
  dateKey: string;
  clue: string;
  loginUrl: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 px-4 pb-[calc(env(safe-area-inset-bottom)+88px)] sm:gap-6 sm:pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <header className="sticky top-0 z-10 backdrop-blur md:static">
        <div className="relative flex items-center justify-center pt-2 pb-0 sm:pt-4">
          <img
            src="/experiments/logo.realitea.webp"
            alt="RealiTea"
            className="h-14 object-contain sm:h-20"
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="rounded-md border border-(--realitea-present-border) bg-(--realitea-present-bg) p-3 text-sm leading-5 text-(--realitea-present-text)">
          <p className="ui-eyebrow">{dateKey}</p>
          <p className="mt-1">{clue}</p>
        </div>

        <Card className="w-full border-(--realitea-present-border)">
          <CardContent className="flex flex-col gap-3 text-center">
            <div>
              <p className="ui-eyebrow">Sign in to play</p>
              <p className="mt-1 text-sm">
                Six guesses a day, saved automatically — sign in to play this puzzle.
              </p>
            </div>
            <Button asChild variant="default">
              <a href={loginUrl}>Sign in to play</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RealiTeaDateRoute() {
  const { puzzle, attempt, signedIn, loginUrl, gameSlug } = useLoaderData<LoaderData>();

  if (!signedIn) {
    return <SignedOutTeaser dateKey={puzzle.dateKey} clue={puzzle.clue} loginUrl={loginUrl} />;
  }

  return (
    <RealiTeaGameBoard
      puzzle={puzzle}
      initialGuesses={attempt?.guesses ?? []}
      loginUrl={loginUrl}
      gameSlug={gameSlug}
    />
  );
}
