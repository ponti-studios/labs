import type { LoaderFunctionArgs } from "react-router";

import { loadActivePuzzle } from "~/lib/realitea-daily-puzzle.server";

export async function loader(_args: LoaderFunctionArgs) {
  const puzzle = await loadActivePuzzle(new Date());

  if (!puzzle) {
    return Response.json(
      {
        error: "No RealiTea puzzle found for today",
      },
      { status: 404 },
    );
  }

  return Response.json(puzzle);
}
