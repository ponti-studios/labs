import { data } from "react-router";
import { z } from "zod";
import { calculateMatchScore } from "../lib/similarity";
import { SymptomListSchema, type Symptom } from "../types/symptom";
import SYMPTOM_DATABASE from "../lib/symptoms.json";

const SymptomRequestSchema = z.object({
  symptom: z.string(),
  intensity: z.number().optional(),
  duration: z.number().optional(),
});

export async function action({ request }: { request: Request }) {
  try {
    const body = SymptomRequestSchema.safeParse(await request.json());
    if (!body.success) {
      return data({ error: "Invalid request data" }, { status: 400 });
    }
    const { symptom, intensity, duration } = body.data;
    if (!symptom) {
      return data({ error: "Symptom is required" }, { status: 400 });
    }

    const symptomDatabaseResult = SymptomListSchema.safeParse(SYMPTOM_DATABASE);
    if (!symptomDatabaseResult.success) {
      console.error(symptomDatabaseResult.error);
      return data({ error: "Unable to load symptom catalog" }, { status: 500 });
    }

    const symptomDatabase: Symptom[] = symptomDatabaseResult.data;
    const scoredSymptoms = symptomDatabase
      .map((dbSymptom) => ({
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
