import { data } from "react-router";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { calculateMatchScore } from "../lib/similarity";
import type { Symptom } from "../types/symptom";

const SymptomRequestSchema = z.object({
  symptom: z.string(),
  intensity: z.number().optional(),
  duration: z.number().optional(),
});

export async function action({ request }: { request: Request }) {
  const SYMPTOM_DATABASE: Symptom[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "src/lib/symptoms.json"), "utf-8"),
  );

  try {
    const body = SymptomRequestSchema.safeParse(await request.json());
    if (!body.success) {
      return data({ error: "Invalid request data" }, { status: 400 });
    }
    const { symptom, intensity, duration } = body.data;
    if (!symptom) {
      return data({ error: "Symptom is required" }, { status: 400 });
    }

    const scoredSymptoms = SYMPTOM_DATABASE.map((dbSymptom) => ({
      ...dbSymptom,
      score: calculateMatchScore(dbSymptom, { symptom, intensity, duration }),
    }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scoredSymptoms.length === 0) {
      return data({ error: "No matching symptoms found" }, { status: 404 });
    }

    const bestMatch = scoredSymptoms[0];
    const { score, ...symptomData } = bestMatch;

    return {
      ...symptomData,
      match_score: score,
      alternatives: scoredSymptoms
        .slice(1, 3)
        .filter((s) => s.score > 50)
        .map(({ score, ...symptomData }) => ({
          ...symptomData,
          match_score: score,
        })),
    };
  } catch (error) {
    console.error(error);
    return data({ error: "Internal server error" }, { status: 500 });
  }
}
