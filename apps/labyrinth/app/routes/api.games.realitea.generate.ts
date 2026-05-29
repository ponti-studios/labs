import type { ActionFunctionArgs } from "react-router";

import { mapPuzzleRecordToStoredPuzzle, parseRhobhDate } from "~/lib/rhobh-daily-puzzle";
import { RhobhSchedulerEnv } from "~/lib/server/env";
import { generateRhobhDailyPuzzle } from "~/lib/server/rhobh-daily-puzzle";

interface GenerateRhobhPuzzlePayload {
  date?: string;
  dateUtc?: string;
}

function isAuthorizedRequest(request: Request): boolean {
  const env = RhobhSchedulerEnv.safeParse(process.env);

  if (!env.success) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${env.data.rhobhDailyPuzzleToken}`;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: GenerateRhobhPuzzlePayload = {};

  try {
    payload = (await request.json()) as GenerateRhobhPuzzlePayload;
  } catch {
    payload = {};
  }

  const date = parseRhobhDate(payload.dateUtc ?? payload.date ?? null) ?? new Date();

  try {
    const puzzle = await generateRhobhDailyPuzzle(date);

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
      puzzle: mapPuzzleRecordToStoredPuzzle(puzzle),
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
