import type { ActionFunctionArgs } from "react-router";

import { requireRealiteaAdmin } from "~/lib/realitea/admin/auth";
import { resolveAdminGame } from "~/lib/realitea/admin/inventory";
import { readPreviewForm } from "~/lib/realitea/admin/preview-form";
import { runPreview, type PreviewProgressEvent } from "~/lib/realitea/admin/preview";
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
  const input = readPreviewForm(form);
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: PreviewProgressEvent | { type: "result"; result: unknown }) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      };
      try {
        const result = await runPreview(game, input, auth.user, (event) => send(event));
        send({ type: "result", result });
      } catch (error) {
        send({
          type: "result",
          result: {
            ok: false,
            code: "INVALID_SOURCE",
            error: error instanceof Error ? error.message : "Preview failed",
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
      "cache-control": "no-store",
    },
  });
}
