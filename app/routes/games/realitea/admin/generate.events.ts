import type { ActionFunctionArgs } from "react-router";

import { getRealiteaAdminActor } from "~/lib/realitea/admin/auth";
import { resolveAdminGame } from "~/lib/realitea/admin/inventory";
import { readGenerateForm } from "~/lib/realitea/admin/generate-form";
import { createGeneration } from "~/lib/realitea/admin/generate.server";
import type { GenerateProgressEvent } from "~/lib/realitea/admin/generate-types";
import { DEFAULT_REALITEA_GAME_SLUG } from "~/lib/realitea/generation/catalog";
import { assertSameOrigin } from "~/lib/server/origin";

export async function action({ request, context }: ActionFunctionArgs) {
  const originDenied = assertSameOrigin(request);
  if (originDenied) return originDenied;

  const auth = getRealiteaAdminActor(context);
  const form = await request.formData();
  const slug = String(form.get("game") ?? DEFAULT_REALITEA_GAME_SLUG);
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
        const result = await createGeneration(game, input, auth.userId, (event) => send(event));
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
