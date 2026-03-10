/**
 * Session API Route
 *
 * IMPROVEMENTS:
 * - Uses auth utilities for cookie extraction
 * - Standardized responses
 * - ~50% less code
 */

import { httpSuccess } from "~/lib/api/response";
import { getCurrentUser } from "~/lib/api/auth";

export const loader = async ({ request }: { request: Request }) => {
  const user = await getCurrentUser(request);
  return httpSuccess.ok({ user });
};
