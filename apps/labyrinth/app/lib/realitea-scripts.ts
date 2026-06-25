import pino from "pino";

/**
 * Creates a script-scoped pino logger.
 * Uses pino-pretty in development for readable console output.
 */
export function createScriptLogger(): pino.Logger {
  return pino(
    process.env.NODE_ENV === "development" ? { transport: { target: "pino-pretty" } } : {},
  );
}

/**
 * Wraps an async function with automatic DB connection cleanup.
 * Ensures `closeDb()` is always called even if the function throws.
 *
 * Note: `closeDb` is intentionally not imported at the top of this file
 * because most callers also import it directly for their catch block.
 * This helper provides a concise alternative for simple scripts.
 */
export async function withDbCleanup<T>(fn: () => Promise<T>): Promise<T> {
  const { closeDb } = await import("@pontistudios/db");
  try {
    return await fn();
  } finally {
    closeDb();
  }
}
