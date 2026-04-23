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

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Get cached value if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store value in cache with TTL (milliseconds)
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Invalidate cached entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate multiple entries by pattern
   */
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp <= entry.ttl) {
        valid++;
      } else {
        expired++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
    };
  }
}

// Global cache instance
export const queryCache = new QueryCache();

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  VOTE_STATS: 30 * 1000, // 30 seconds
  TRACKER_LIST: 60 * 1000, // 1 minute
  TRACKER_DETAIL: 30 * 1000, // 30 seconds
  USER_SESSION: 5 * 60 * 1000, // 5 minutes
};

/**
 * Cached wrapper for async functions
 */
export async function withCache<T>(key: string, fn: () => Promise<T>, ttlMs: number): Promise<T> {
  const cached = queryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fn();
  queryCache.set(key, data, ttlMs);
  return data;
}

/**
 * Invalidate cache for a tracker (call after vote/tracker updates)
 */
export function invalidateTrackerCache(trackerId: string): void {
  queryCache.invalidate(`tracker:${trackerId}`);
  queryCache.invalidate(`tracker:${trackerId}:stats`);
  queryCache.invalidatePattern(new RegExp(`^trackers:`));
}
