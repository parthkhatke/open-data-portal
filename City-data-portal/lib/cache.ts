// Simple in-memory cache for Lens API data
// Provides automatic caching with TTL and stale-while-revalidate

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL: number;
  private revalidating = new Set<string>();

  constructor(ttlMinutes: number = 10) {
    this.defaultTTL = ttlMinutes * 60 * 1000;
  }

  /**
   * Get data from cache if valid
   */
  get<T>(key: string): { data: T; stale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const isExpired = now > entry.expiresAt;
    
    // Return data even if stale (stale-while-revalidate pattern)
    return {
      data: entry.data as T,
      stale: isExpired,
    };
  }

  /**
   * Store data in cache
   */
  set<T>(key: string, data: T, ttlMinutes?: number): void {
    const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTTL;
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Check if currently revalidating a key
   */
  isRevalidating(key: string): boolean {
    return this.revalidating.has(key);
  }

  /**
   * Mark key as being revalidated
   */
  startRevalidation(key: string): void {
    this.revalidating.add(key);
  }

  /**
   * Mark revalidation complete
   */
  endRevalidation(key: string): void {
    this.revalidating.delete(key);
  }

  /**
   * Get or fetch with stale-while-revalidate
   * Returns cached data immediately if available (even if stale),
   * then revalidates in the background if needed
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMinutes?: number
  ): Promise<{ data: T; cached: boolean; revalidated: boolean }> {
    const cached = this.get<T>(key);

    // If we have fresh data, return it
    if (cached && !cached.stale) {
      return { data: cached.data, cached: true, revalidated: false };
    }

    // If we have stale data and not already revalidating, start background revalidation
    if (cached && cached.stale && !this.isRevalidating(key)) {
      this.startRevalidation(key);
      
      // Background revalidation (don't await)
      fetcher()
        .then(data => {
          this.set(key, data, ttlMinutes);
        })
        .catch(err => {
          console.warn(`Background revalidation failed for ${key}:`, err.message);
        })
        .finally(() => {
          this.endRevalidation(key);
        });

      // Return stale data immediately
      return { data: cached.data, cached: true, revalidated: true };
    }

    // If we have stale data and already revalidating, just return stale
    if (cached) {
      return { data: cached.data, cached: true, revalidated: false };
    }

    // No cached data - must fetch
    try {
      const data = await fetcher();
      this.set(key, data, ttlMinutes);
      return { data, cached: false, revalidated: false };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove a key from cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.revalidating.clear();
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Delete a key from cache (alias for invalidate)
   */
  delete(key: string): void {
    this.invalidate(key);
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[]; entries: { key: string; expiresIn: number; stale: boolean }[] } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      expiresIn: Math.max(0, Math.round((entry.expiresAt - now) / 1000)),
      stale: now > entry.expiresAt,
    }));

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries,
    };
  }

  /**
   * Get or fetch without stale-while-revalidate
   * Always returns fresh data (waits for fetch if cache is stale/missing)
   * Use this for time-sensitive queries like year filters
   */
  async getOrFetchFresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMinutes?: number
  ): Promise<{ data: T; cached: boolean }> {
    const cached = this.get<T>(key);

    // Only return cached data if it's fresh (not stale)
    if (cached && !cached.stale) {
      return { data: cached.data, cached: true };
    }

    // Fetch fresh data and wait for it
    try {
      const data = await fetcher();
      this.set(key, data, ttlMinutes);
      return { data, cached: false };
    } catch (error) {
      // If fetch fails but we have stale data, return it as last resort
      if (cached) {
        console.warn(`Fetch failed for ${key}, returning stale data`);
        return { data: cached.data, cached: true };
      }
      throw error;
    }
  }
}

// Singleton cache instance - 10 minute TTL
export const apiCache = new SimpleCache(10);

// Helper to create cache keys
export function cacheKey(domain: string, year?: number): string {
  return year ? `${domain}:${year}` : domain;
}
