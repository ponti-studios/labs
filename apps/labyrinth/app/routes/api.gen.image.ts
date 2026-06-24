import { generateImageFromPrompt } from "@pontistudios/ai";
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

import { LabyrinthServerEnv } from "~/lib/server/env";
import { uploadImage } from "~/lib/server/storage";
import { buildGenerativeImagePrompt } from "~/components/generative-image/state";

const generativeImageConfigSchema = z.object({
  image_specifications: z.object({
    format: z.string().min(1),
    dimensions: z.string().min(1),
    aesthetic: z.array(z.string().min(1)).min(1),
  }),
  subject: z.object({
    pose: z.string().min(1),
    expression: z.string().min(1),
    skin_rendering: z.string().min(1),
    editing_constraint: z.string().min(1),
  }),
  attire: z.object({
    top: z.string().min(1),
    bottom: z.string().min(1),
  }),
  environment: z.object({
    setting: z.string().min(1),
    primary_prop: z.string().min(1),
    background: z.object({
      visibility: z.string().min(1),
      bokeh: z.string().min(1),
      ambient_elements: z.string().min(1),
    }),
  }),
  lighting: z.object({
    type: z.string().min(1),
    effects: z.array(z.string().min(1)).min(1),
  }),
  visual_style: z.object({
    color_palette: z.string().min(1),
    texture: z.string().min(1),
    lens_characteristics: z.string().min(1),
  }),
});

const requestSchema = z.object({
  config: generativeImageConfigSchema,
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

  const env = LabyrinthServerEnv.parse(process.env);

  try {
    const body = requestSchema.parse(await request.json());
    const size =
      body.config.image_specifications.dimensions.replace(/px$/i, "").trim() || "1024x1024";
    const promptText = buildGenerativeImagePrompt(body.config);
    const imageData = await generateImageFromPrompt(promptText, {
      apiKey: env.openRouterApiKey,
      outputFormat: "png",
      quality: "high",
      size,
    });

    const key = `generative-image/${Date.now()}.png`;
    const imageUrl = await uploadImage(imageData, key, env);

    return Response.json({ imageUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request payload" }, { status: 400 });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected image generation failure" },
      { status: 500 },
    );
  }
}
