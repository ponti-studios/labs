import type { LoaderFunctionArgs } from "react-router";

import { parseRhobhDate } from "~/lib/rhobh-daily-puzzle";
import { getPuzzleForDate, getPuzzleKeyForDate } from "~/lib/rhobh-wordle";
import { loadRhobhPuzzleForDate } from "~/lib/server/rhobh-daily-puzzle";

function buildStaticResponse(date: Date) {
  const puzzle = getPuzzleForDate(date);

  return {
    puzzle: {
      ...puzzle,
      puzzleKey: getPuzzleKeyForDate(date),
      source: "static" as const,
    },
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const date = parseRhobhDate(url.searchParams.get("date")) ?? new Date();

  try {
    return Response.json(await loadRhobhPuzzleForDate(date, getPuzzleForDate(date)));
  } catch {
    return Response.json(buildStaticResponse(date));
  }
}
