import type { LoaderFunctionArgs } from "react-router";

import { parseDate } from "~/lib/realitea-daily-puzzle";
import { getPuzzleForDate, getPuzzleKeyForDate } from "~/lib/realitea";
import { loadPuzzleForDate } from "~/lib/realitea-daily-puzzle.server";

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
  const date = parseDate(url.searchParams.get("date")) ?? new Date();

  try {
    return Response.json(await loadPuzzleForDate(date, getPuzzleForDate(date)));
  } catch {
    return Response.json(buildStaticResponse(date));
  }
}
