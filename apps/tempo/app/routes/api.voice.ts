import { GoogleGenAI } from "@google/genai";

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "AI service not configured" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as VoiceRequest;
    const { audioBase64, mimeType, existingTags } = body;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          parts: [
            {
              text: `You are a task extraction assistant. Listen to this audio and extract a task description.
Return JSON with: title (string), estimatedMinutes (number), tags (array of strings from: ${existingTags.join(", ") || "none"}).
If no task is found, return null.`,
            },
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
          ],
        },
      ],
      config: { responseMimeType: "application/json" },
    });

    const text = response.text || "null";
    const result = JSON.parse(text) as VoiceTaskResult | null;
    return Response.json(result);
  } catch (error) {
    console.error("Voice processing failed:", error);
    return Response.json({ error: "Failed to process audio" }, { status: 500 });
  }
}
