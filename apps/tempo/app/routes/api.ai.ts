import { GoogleGenAI, Type } from "@google/genai";

interface SubTask {
  title: string;
  estimatedMinutes: number;
}

interface AiSplitRequest {
  taskTitle: string;
  estimatedMinutes: number;
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
    const body = (await request.json()) as AiSplitRequest;
    const { taskTitle, estimatedMinutes } = body;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Decompose the following task into a logical sequence of sub-tasks for a deep work session.
Original Task: "${taskTitle}"
Total Available Time: ${estimatedMinutes} minutes.

Requirements:
1. Every sub-task must have a clear, actionable title.
2. The sum of sub-task durations should equal approximately ${estimatedMinutes} minutes.
3. Sub-tasks should be between 30 and 90 minutes each if possible.
4. Ensure the sequence is logical for completion.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              estimatedMinutes: { type: Type.NUMBER },
            },
            required: ["title", "estimatedMinutes"],
          },
        },
      },
    });

    const subtasks = JSON.parse(response.text || "[]") as SubTask[];
    return Response.json(subtasks);
  } catch (error) {
    console.error("AI split failed:", error);
    return Response.json({ error: "Failed to generate breakdown" }, { status: 500 });
  }
}
