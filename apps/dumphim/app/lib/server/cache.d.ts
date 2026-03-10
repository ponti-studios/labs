/**
 * Simple In-Memory Cache for Database Queries
 *
 * USE CASES:
 * - Vote stats (updates infrequently, read frequently)
 * - Tracker lists (can tolerate slight staleness)
 * - User sessions (short TTL)
 *
 * PRODUCTION NOTE: Replace with Redis for distributed caching
 */
declare class QueryCache {
  private cache;
  /**
   * Get cached value if not expired
   */
  get<T>(key: string): T | null;
  /**
   * Store value in cache with TTL (milliseconds)
   */
  set<T>(key: string, data: T, ttlMs: number): void;
  /**
   * Invalidate cached entry
   */
  invalidate(key: string): void;
  /**
   * Invalidate multiple entries by pattern
   */
  invalidatePattern(pattern: RegExp): void;
  /**
   * Clear all cached entries
   */
  clear(): void;
  /**
   * Get cache stats
   */
  getStats(): {
    total: number;
    valid: number;
    expired: number;
  };
}
export declare const queryCache: QueryCache;
export declare const CACHE_TTL: {
  VOTE_STATS: number;
  TRACKER_LIST: number;
  TRACKER_DETAIL: number;
  USER_SESSION: number;
};
/**
 * Cached wrapper for async functions
 */
export declare function withCache<T>(key: string, fn: () => Promise<T>, ttlMs: number): Promise<T>;
/**
 * Invalidate cache for a tracker (call after vote/tracker updates)
 */
export declare function invalidateTrackerCache(trackerId: string): void;
export {};
//# sourceMappingURL=cache.d.ts.map
