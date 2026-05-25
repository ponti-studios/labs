import { z } from "zod";
import { buildFallbackDailyReading } from "~/lib/tarot-daily";
import type { DailyTarotCard, DailyTarotReading, DailyTarotResult } from "~/lib/tarot-types";

const responseSchema = z.object({
  headline: z.string().min(1),
  todayMessage: z.string().min(1),
  focus: z.string().min(1),
  reflectionPrompt: z.string().min(1),
  careNote: z.string().min(1),
});

function getApiKey() {
  return process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || null;
}

function extractResponseText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ text?: unknown }> }>;
  };

  if (typeof candidate.output_text === "string" && candidate.output_text.length > 0) {
    return candidate.output_text;
  }

  for (const item of candidate.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string" && content.text.length > 0) {
        return content.text;
      }
    }
  }

  return null;
}

async function generateAiReading(
  card: DailyTarotCard,
  dateKey: string,
): Promise<DailyTarotReading | null> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      instructions:
        "You write concise daily tarot reflections. Keep the tone grounded, calm, and reflective. Avoid predictions, certainty, medical claims, legal claims, or supernatural authority. Return valid JSON only.",
      input: `Create a daily tarot reading for ${dateKey} using this card context:\n${JSON.stringify(
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
      max_output_tokens: 350,
      text: {
        format: {
          type: "json_schema",
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
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const text = extractResponseText(payload);

  if (!text) {
    return null;
  }

  try {
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
