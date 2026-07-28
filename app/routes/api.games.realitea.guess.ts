import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

import { evaluateGuessServer } from "~/lib/realitea/puzzle.server";

const payloadSchema = z.object({
  dateKey: z.string().min(1),
  previousGuesses: z
    .array(z.object({ word: z.string().min(1) }))
    .max(6)
    .default([]),
  word: z.string().min(1).max(64),
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

  const result = await evaluateGuessServer(parsed.dateKey, parsed.word, parsed.previousGuesses);

  return Response.json(result);
}
