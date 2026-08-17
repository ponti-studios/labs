import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

import { getHominemUser } from "~/lib/server/hominem-auth";
import { DEFAULT_REALITEA_GAME_SLUG } from "~/lib/realitea/generation/catalog";
import { evaluateGuessServer } from "~/lib/realitea/server/puzzle.server";

const payloadSchema = z.object({
  dateKey: z.string().min(1),
  // Only trusted for anonymous players, and only to gate the single free
  // guess client-side — see evaluateGuessServer's doc comment. Signed-in
  // players are checked against games_attempts instead.
  previousGuesses: z
    .array(z.object({ word: z.string().min(1) }))
    .max(6)
    .default([]),
  word: z.string().min(1).max(64),
  gameSlug: z.string().min(1).max(80).default(DEFAULT_REALITEA_GAME_SLUG),
});

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let parsed: z.infer<typeof payloadSchema>;
  try {
    const body = (await request.json()) as unknown;
    parsed = payloadSchema.parse(body);
  } catch {
    return Response.json({ error: "Invalid guess payload" }, { status: 400 });
  }

  const user = await getHominemUser(request);
  const result = await evaluateGuessServer(
    parsed.dateKey,
    parsed.word,
    user,
    parsed.previousGuesses.length,
    parsed.gameSlug,
  );

  return Response.json(result);
}
