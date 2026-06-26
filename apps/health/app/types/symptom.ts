import { z } from "zod";

export const TREATMENT_GUIDANCE = {
  IMMEDIATE_CARE: "immediate-care",
  NONIMMEDIATE_CARE: "nonimmediate-care",
  NO_CARE: "no-care",
} as const;

export type TreatmentGuidance = (typeof TREATMENT_GUIDANCE)[keyof typeof TREATMENT_GUIDANCE];

export interface Symptom {
  name: string;
  description: string;
  severity_score: number;
  treatment_guidance: TreatmentGuidance;
  articles?: { title: string; url: string }[];
  image_url?: string;
  intensity_range: [number, number];
  duration_range: [number, number];
}

const SymptomSchema = z.object({
  name: z.string(),
  description: z.string(),
  severity_score: z.number(),
  treatment_guidance: z.enum([
    TREATMENT_GUIDANCE.IMMEDIATE_CARE,
    TREATMENT_GUIDANCE.NONIMMEDIATE_CARE,
    TREATMENT_GUIDANCE.NO_CARE,
  ]),
  articles: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
      }),
    )
    .optional(),
  image_url: z.string().optional(),
  intensity_range: z.tuple([z.number(), z.number()]),
  duration_range: z.tuple([z.number(), z.number()]),
});

export const SymptomListSchema = z.array(SymptomSchema);

export type PatientSymptom = Symptom & {
  id: string;
  painLevel?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
};

export const SymptomRequestSchema = z.object({
  symptom: z.string(),
  intensity: z.number().optional(),
  duration: z.number().optional().describe("Duration in hours"),
  articles: z
    .array(
      z.object({
        title: z.string(),
        url: z.url(),
      }),
    )
    .optional(),
});
export type SymptomRequest = z.infer<typeof SymptomRequestSchema>;

export type MatchedSymptom = Symptom & {
  match_score: number;
  alternatives?: MatchedSymptom[];
};
export type SymptomRequestResponse = MatchedSymptom;
