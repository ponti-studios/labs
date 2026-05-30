import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

const directorConfigSchema = z.object({
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
  config: directorConfigSchema,
});

function getImagenApiKey() {
  return (
    process.env.GOOGLE_IMAGEN_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GOOGLE_API_KEY ||
    null
  );
}

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

  const apiKey = getImagenApiKey();

  if (!apiKey) {
    return Response.json({ error: "Missing Google Imagen API key" }, { status: 500 });
  }

  try {
    const body = requestSchema.parse(await request.json());
    const promptText = `Generate a photorealistic image based on these strict specifications: ${JSON.stringify(
      body.config,
      null,
      2,
    )}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: promptText,
            },
          ],
          parameters: {
            sampleCount: 1,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `Generation failed: ${response.status} ${errorText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const imageBytes = data?.predictions?.[0]?.bytesBase64Encoded;

    if (typeof imageBytes !== "string" || imageBytes.length === 0) {
      return Response.json({ error: "No image data received from the API." }, { status: 502 });
    }

    return Response.json({ imageData: `data:image/png;base64,${imageBytes}` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request payload" }, { status: 400 });
    }

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unexpected image generation failure",
      },
      { status: 500 },
    );
  }
}
