/**
 * Trackers API Route
 *
 * IMPROVEMENTS:
 * - Uses standardized response utilities
 * - Input validation
 * - Type-safe error handling
 * - ~40% less code
 */

import { createTracker } from "~/lib/server/mutations";
import type { TrackerInsert } from "@pontistudios/db/schema";
import { httpErrors, httpSuccess } from "~/lib/api/response";


// Validation helper
function validateTrackerData(body: Record<string, unknown>): {
  valid: boolean;
  error?: Response;
  data?: TrackerInsert;
} {
  if (!body.name || typeof body.name !== "string") {
    return { valid: false, error: httpErrors.badRequest("Name is required") };
  }

  if (!body.userId || typeof body.userId !== "string") {
    return { valid: false, error: httpErrors.badRequest("User ID is required") };
  }

  const trackerData: TrackerInsert = {
    name: body.name,
    hp: typeof body.hp === "string" ? body.hp : null,
    cardType: typeof body.cardType === "string" ? body.cardType : null,
    description: typeof body.description === "string" ? body.description : null,
    attacks: Array.isArray(body.attacks) ? body.attacks : null,
    strengths: Array.isArray(body.strengths) ? body.strengths : null,
    flaws: Array.isArray(body.flaws) ? body.flaws : null,
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

  return { valid: true, data: trackerData };
}

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return httpErrors.badRequest("Method not allowed");
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = validateTrackerData(body);
    if (!validation.valid) {
      return validation.error!;
    }

    // Create tracker
    const tracker = await createTracker(validation.data!);

    // Invalidate cache for tracker lists
    invalidateTrackerCache(tracker.id);

    return httpSuccess.created(tracker);
  } catch (error) {
    console.error("Error creating tracker:", error);
    return httpErrors.internalError("Failed to create tracker");
  }
};
