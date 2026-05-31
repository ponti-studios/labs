import type { LoaderFunctionArgs } from "react-router";

import { parseDate } from "~/lib/realitea-daily-puzzle";
import { loadPuzzleForDate } from "~/lib/realitea-daily-puzzle.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const date = parseDate(url.searchParams.get("date")) ?? new Date();
  const puzzle = await loadPuzzleForDate(date);

  if (!puzzle) {
    return Response.json(
      {
        error: `No RealiTea puzzle found for ${url.searchParams.get("date") ?? date.toDateString()}`,
      },
      { status: 404 },
    );
  }

  return Response.json(puzzle);
}
