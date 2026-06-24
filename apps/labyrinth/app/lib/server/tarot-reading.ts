import { z } from "zod";
import { chatCompletion } from "@pontistudios/ai";
import { buildFallbackDailyReading } from "~/lib/tarot-daily";
import type { DailyTarotCard, DailyTarotReading, DailyTarotResult } from "~/lib/tarot-types";

const responseSchema = z.object({
  headline: z.string().min(1),
  todayMessage: z.string().min(1),
  focus: z.string().min(1),
  reflectionPrompt: z.string().min(1),
  careNote: z.string().min(1),
});

function extractResponseContent(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };

  const content = candidate.choices?.[0]?.message?.content;

  if (typeof content === "string" && content.length > 0) {
    return content;
  }

  return null;
}

async function generateAiReading(
  card: DailyTarotCard,
  dateKey: string,
): Promise<DailyTarotReading | null> {
  try {
    const response = await chatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You write concise daily tarot reflections. Keep the tone grounded, calm, and reflective. Avoid predictions, certainty, medical claims, legal claims, or supernatural authority. Return valid JSON only.",
        },
        {
          role: "user",
          content: `Create a daily tarot reading for ${dateKey} using this card context:\n${JSON.stringify(
            {
              name: card.name,
              arcana: card.arcana,
              suit: card.suit,
              rank: card.rank,
              keywords: card.keywords,
              curatedReading: card.curatedReading,
              reflectionQuestions: card.reflectionQuestions,
            },
            null,
            2,
          )}`,
        },
      ],
      maxTokens: 350,
      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          name: "daily_tarot_reading",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["headline", "todayMessage", "focus", "reflectionPrompt", "careNote"],
            properties: {
              headline: { type: "string" },
              todayMessage: { type: "string" },
              focus: { type: "string" },
              reflectionPrompt: { type: "string" },
              careNote: { type: "string" },
            },
          },
        },
      },
    });

    const text = extractResponseContent(response);

    if (!text) {
      return null;
    }

    return responseSchema.parse(JSON.parse(text));
  } catch {
    return null;
  }
}

export async function buildDailyTarotResult(
  card: DailyTarotCard,
  dateKey: string,
): Promise<DailyTarotResult> {
  const aiReading = await generateAiReading(card, dateKey);

  return {
    date: dateKey,
    card,
    reading: aiReading ?? buildFallbackDailyReading(card, dateKey),
    source: aiReading ? "ai" : "curated",
  };
}
