import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface VoiceTaskResult {
  title: string;
  estimatedMinutes: number;
  priority: "P0" | "P1" | "P2" | "P3";
  description?: string;
  tags: string[];
}

export const processVoiceTask = async (
  base64Audio: string,
  mimeType: string,
  existingTags: string[] = [],
): Promise<VoiceTaskResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Audio,
          },
        },
        {
          text: `Extract task details from this audio. 
          Respond with a JSON object representing the task.
          
          Context:
          - Existing tags in the system: ${existingTags.join(", ") || "None"}
          
          Schema:
          - title (string): A concise, actionable title for the task.
          - estimatedMinutes (number): How long the task will take in minutes. Default to 30 if not specified.
          - priority (string): One of "P0", "P1", "P2", "P3". If not specified, infer from importance or default to "P2".
          - description (string): Any additional context or details mentioned.
          - tags (array of strings): Categories for the task. IF a similar category exists in the "Existing tags", USE THAT EXACT STRING. Otherwise, create 1-2 relevant new tags.
          
          Requirements:
          - Response must be ONLY the JSON object.
          - Be accurate to the user's spoken words.`,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            estimatedMinutes: { type: Type.NUMBER },
            priority: {
              type: Type.STRING,
              enum: ["P0", "P1", "P2", "P3"],
            },
            description: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "estimatedMinutes", "priority", "tags"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  } catch (error) {
    console.error("Voice processing failed:", error);
    return null;
  }
};
