import type { ActionFunctionArgs } from "react-router";

import { mapRecordToStoredPuzzle, parseDate } from "~/lib/realitea-daily-puzzle";
import { DailyPuzzleSchedulerEnv } from "~/lib/server/env";
import { generateDailyPuzzle } from "~/lib/realitea-daily-puzzle.server";

interface GeneratePuzzlePayload {
  date?: string;
  dateUtc?: string;
}

function isAuthorizedRequest(request: Request): boolean {
  const env = DailyPuzzleSchedulerEnv.safeParse(process.env);

  if (!env.success) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${env.data.dailyPuzzleToken}`;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: GeneratePuzzlePayload = {};

  try {
    payload = (await request.json()) as GeneratePuzzlePayload;
  } catch {
    payload = {};
  }

  const date = parseDate(payload.dateUtc ?? payload.date ?? null) ?? new Date();

  try {
    const puzzle = await generateDailyPuzzle(date);

    if (!puzzle) {
      return Response.json(
        {
          dateUtc: date.toISOString().slice(0, 10),
          status: "fallback",
        },
        { status: 503 },
      );
    }

    return Response.json({
      dateUtc: puzzle.dateUtc,
      puzzle: mapRecordToStoredPuzzle(puzzle),
      status: "published",
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate RHOBH puzzle",
      },
      { status: 500 },
    );
  }
}
