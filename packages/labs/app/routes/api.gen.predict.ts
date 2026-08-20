import { chatCompletion } from "~/lib/server/ai";
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

import { assertSameOrigin } from "~/lib/server/origin";

const requestSchema = z.object({
  context: z.string().min(1),
});

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const originDenied = assertSameOrigin(request);
  if (originDenied) return originDenied;

  try {
    const body = requestSchema.parse(await request.json());

    const response = await chatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are continuing text that has already been started. Match the style, tone, and format of the existing text naturally. Return only the continuation.",
        },
        { role: "user", content: body.context },
      ],
      temperature: 0.7,
      maxTokens: 200,
    });

    const output = response.choices?.[0]?.message?.content || "";

    return Response.json({ output });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request payload" }, { status: 400 });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}
