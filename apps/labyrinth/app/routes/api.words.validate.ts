import type { ActionFunctionArgs } from "react-router";

import { isValidWord } from "~/lib/word-list.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let word: unknown;
  try {
    ({ word } = (await request.json()) as { word: unknown });
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof word !== "string" || word.trim().length === 0) {
    return Response.json({ error: "word must be a non-empty string" }, { status: 400 });
  }

  return Response.json({ valid: isValidWord(word) });
}
