import { getSql } from "./drizzle";

/** Fixed int4 pair for `pg_try_advisory_lock`. Used by the what:generate CLI script (run locally and from GitHub Actions). */
export const WHAT_GENERATE_LOCK_KEYS = [42, 17] as const;

export type GenerateLockResult<T> = { ok: true; value: T } | { ok: false; code: "lock_busy" };

/**
 * Run `fn` while holding a session advisory lock on a reserved postgres.js
 * connection. Domain queries stay on the pooled `db` proxy. Never use a
 * blocking `pg_advisory_lock`.
 */
export async function withGenerateLock<T>(fn: () => Promise<T>): Promise<GenerateLockResult<T>> {
  const reserved = await getSql().reserve();
  try {
    const [row] = await reserved<[{ locked: boolean }]>`
      SELECT pg_try_advisory_lock(${WHAT_GENERATE_LOCK_KEYS[0]}, ${WHAT_GENERATE_LOCK_KEYS[1]}) AS locked
    `;
    if (!row?.locked) return { ok: false, code: "lock_busy" };

    try {
      return { ok: true, value: await fn() };
    } finally {
      await reserved`
        SELECT pg_advisory_unlock(${WHAT_GENERATE_LOCK_KEYS[0]}, ${WHAT_GENERATE_LOCK_KEYS[1]})
      `;
    }
  } finally {
    reserved.release();
  }
}
