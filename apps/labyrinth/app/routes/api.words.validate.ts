import type { ActionFunctionArgs } from "react-router";

import { isValidWord } from "~/lib/word-list.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { word } = (await request.json()) as { word?: unknown };

    if (typeof word !== "string") {
      return Response.json({ error: "Invalid word payload" }, { status: 400 });
    }

    return Response.json({ valid: await isValidWord(word) });
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
}
