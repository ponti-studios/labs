import { chat, createOpenRouterTextAdapter, transcribeAudio } from "@pontistudios/ai";
import { z } from "zod";

interface VoiceRequest {
  audioBase64: string;
  mimeType: string;
  existingTags: string[];
}

export interface VoiceTaskResult {
  title: string;
  estimatedMinutes: number;
  tags: string[];
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "AI service not configured" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as VoiceRequest;
    const { audioBase64, mimeType, existingTags } = body;

    const transcript = await transcribeAudio(audioBase64, mimeType, { apiKey });
    const result = await chat({
      adapter: createOpenRouterTextAdapter({ apiKey }),
      stream: false,
      messages: [
        {
          role: "user",
          content: `You are a task extraction assistant. Convert this voice transcript into a task.
Transcript: ${transcript}

Return JSON with title (string), estimatedMinutes (number), and tags (array of strings from: ${existingTags.join(", ") || "none"}).
If no task is found, return null.`,
        },
      ],
      outputSchema: z
        .object({
          title: z.string(),
          estimatedMinutes: z.number(),
          tags: z.array(z.string()),
        })
        .nullable(),
    });

    return Response.json(result);
  } catch (error) {
    console.error("Voice processing failed:", error);
    return Response.json({ error: "Failed to process audio" }, { status: 500 });
  }
}
