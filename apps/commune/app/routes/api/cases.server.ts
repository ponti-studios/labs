import { createCase } from "~/lib/server/mutations";
import type { CaseCreateInput } from "~/lib/server/mutations";
import { httpErrors, httpSuccess } from "~/lib/api/response";
import { invalidateCaseCache } from "~/lib/server/cache";

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") return httpErrors.badRequest("Method not allowed");

  try {
    const body = await request.json();

    if (!body.rawSituation || typeof body.rawSituation !== "string") {
      return httpErrors.badRequest("rawSituation is required");
    }
    if (!body.neutralSituation || typeof body.neutralSituation !== "string") {
      return httpErrors.badRequest("neutralSituation is required");
    }
    if (!body.question || typeof body.question !== "string") {
      return httpErrors.badRequest("question is required");
    }

    const data: CaseCreateInput = {
      rawSituation: body.rawSituation,
      neutralSituation: body.neutralSituation,
      question: body.question,
      label: typeof body.label === "string" ? body.label : null,
      quorumSize: typeof body.quorumSize === "number" ? body.quorumSize : 3,
      userId: null,
    };

    const caseRecord = await createCase(data);
    invalidateCaseCache(caseRecord.id);
    return httpSuccess.created(caseRecord);
  } catch (error) {
    console.error("Error creating case:", error);
    return httpErrors.internalError("Failed to create case");
  }
};
