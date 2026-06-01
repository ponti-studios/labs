interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

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

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;
    for (const entry of this.cache.values()) {
      if (now - entry.timestamp <= entry.ttl) valid++;
      else expired++;
    }
    return { total: this.cache.size, valid, expired };
  }
}

export const queryCache = new QueryCache();

export const CACHE_TTL = {
  VERDICT_STATS: 30 * 1000,
  CASE_LIST: 60 * 1000,
  CASE_DETAIL: 30 * 1000,
  USER_SESSION: 5 * 60 * 1000,
};

export async function withCache<T>(key: string, fn: () => Promise<T>, ttlMs: number): Promise<T> {
  const cached = queryCache.get<T>(key);
  if (cached !== null) return cached;
  const data = await fn();
  queryCache.set(key, data, ttlMs);
  return data;
}

export function invalidateCaseCache(caseId: string): void {
  queryCache.invalidate(`case:${caseId}`);
  queryCache.invalidate(`case:${caseId}:stats`);
  queryCache.invalidatePattern(/^cases:/);
}
