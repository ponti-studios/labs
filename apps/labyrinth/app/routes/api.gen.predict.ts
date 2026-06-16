import { createOpenRouterClient } from "@pontistudios/ai";
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

const requestSchema = z.object({
  context: z.string().min(1),
});

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) {
    return false;
  }
  return origin === new URL(request.url).origin;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (!isAllowedOrigin(request)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = requestSchema.parse(await request.json());

    const client = createOpenRouterClient();

    const response = await client.chat.send({
      chatRequest: {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are continuing a code generation session. Complete the output started in the context.",
          },
          { role: "user", content: body.context },
        ],
        temperature: 0.7,
        max_tokens: 200,
      },
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
