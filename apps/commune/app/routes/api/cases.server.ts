import { createCase } from "~/lib/server/mutations";
import type { CaseCreateInput } from "~/lib/server/mutations";
import { httpErrors, httpSuccess } from "~/lib/api/response";
import { invalidateCaseCache } from "~/lib/server/cache";

function validateCaseData(body: Record<string, unknown>): {
  valid: boolean;
  error?: Response;
  data?: CaseCreateInput;
} {
  if (!body.name || typeof body.name !== "string") {
    return { valid: false, error: httpErrors.badRequest("Name is required") };
  }
  if (!body.userId || typeof body.userId !== "string") {
    return { valid: false, error: httpErrors.badRequest("User ID is required") };
  }

  const data: CaseCreateInput = {
    name: body.name,
    hp: typeof body.hp === "string" ? body.hp : null,
    cardType: typeof body.cardType === "string" ? body.cardType : null,
    description: typeof body.description === "string" ? body.description : null,
    attacks: Array.isArray(body.attacks)
      ? (body.attacks as { name: string; damage: number }[])
      : null,
    strengths: Array.isArray(body.strengths) ? (body.strengths as string[]) : null,
    flaws: Array.isArray(body.flaws) ? (body.flaws as string[]) : null,
    commitmentLevel: typeof body.commitmentLevel === "string" ? body.commitmentLevel : null,
    colorTheme: typeof body.colorTheme === "string" ? body.colorTheme : null,
    photoUrl: typeof body.photoUrl === "string" ? body.photoUrl : null,
    imageScale: typeof body.imageScale === "number" ? body.imageScale : null,
    imagePosition:
      typeof body.imagePosition === "object" && body.imagePosition !== null
        ? (body.imagePosition as { x: number; y: number })
        : null,
    userId: body.userId,
  };

  return { valid: true, data };
}

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") return httpErrors.badRequest("Method not allowed");

  try {
    const body = await request.json();
    const validation = validateCaseData(body);
    if (!validation.valid) return validation.error!;

    const caseRecord = await createCase(validation.data!);
    invalidateCaseCache(caseRecord.id);
    return httpSuccess.created(caseRecord);
  } catch (error) {
    console.error("Error creating case:", error);
    return httpErrors.internalError("Failed to create case");
  }
};
