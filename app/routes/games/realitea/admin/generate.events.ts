import type { ActionFunctionArgs } from "react-router";

import { requireRealiteaAdmin } from "~/lib/realitea/admin/auth";
import { resolveAdminGame } from "~/lib/realitea/admin/inventory";
import { readGenerateForm } from "~/lib/realitea/admin/generate-form";
import { createGeneration, type GenerateProgressEvent } from "~/lib/realitea/admin/generate";
import { assertSameOrigin } from "~/lib/server/origin";

const DEFAULT_GAME = "rhobh";

export async function action({ request }: ActionFunctionArgs) {
  const originDenied = assertSameOrigin(request);
  if (originDenied) return originDenied;

  const auth = await requireRealiteaAdmin(request, "action");
  const form = await request.formData();
  const slug = String(form.get("game") ?? DEFAULT_GAME);
  const game = await resolveAdminGame(slug);
  if (!game) {
    return Response.json({ ok: false, error: "No active RealiTea topic found" }, { status: 404 });
  }

  const encoder = new TextEncoder();
  const input = readGenerateForm(form);
  const stream = new ReadableStream({
    async start(controller) {
      const send = async (payload: GenerateProgressEvent | { type: "result"; result: unknown }) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      };
      try {
        const result = await createGeneration(game, input, auth.user, (event) => send(event));
        await send({ type: "result", result });
      } catch (error) {
        await send({
          type: "result",
          result: {
            ok: false,
            code: "INVALID_SOURCE",
            error: error instanceof Error ? error.message : "Generation failed",
          },
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "x-accel-buffering": "no",
      "x-content-type-options": "nosniff",
    },
  });
}
