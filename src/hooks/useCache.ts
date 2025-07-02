import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
  maxSize?: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };

    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  isStale(key: string, staleTime = 30 * 1000): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    
    return Date.now() - entry.timestamp > staleTime;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global cache instance
const globalCache = new CacheManager(200);

export const useCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    staleWhileRevalidate = true,
    maxSize = 100
  } = options;

  const [data, setData] = useState<T | null>(() => globalCache.get<T>(key));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = globalCache.get<T>(key);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          
          // If stale-while-revalidate is enabled and data is stale, fetch in background
          if (staleWhileRevalidate && globalCache.isStale(key)) {
            // Background fetch without setting loading state
            fetcher()
              .then(freshData => {
                globalCache.set(key, freshData, ttl);
                setData(freshData);
              })
              .catch(console.error);
          }
          return;
        }
      }

      setLoading(true);
      setError(null);

      const freshData = await fetcher();
      globalCache.set(key, freshData, ttl);
      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Cache fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, staleWhileRevalidate]);

  const invalidate = useCallback(() => {
    globalCache.invalidate(key);
    setData(null);
  }, [key]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    isStale: globalCache.isStale(key)
  };
};

export const useCacheInvalidation = () => {
  const invalidatePattern = useCallback((pattern: string) => {
    globalCache.invalidatePattern(pattern);
  }, []);

  const invalidateKey = useCallback((key: string) => {
    globalCache.invalidate(key);
  }, []);

  const clearCache = useCallback(() => {
    globalCache.clear();
  }, []);

  const getCacheStats = useCallback(() => {
    return globalCache.getStats();
  }, []);

  return {
    invalidatePattern,
    invalidateKey,
    clearCache,
    getCacheStats
  };
};

// Specialized hooks for common data patterns
export const useCachedUserStats = (userId: string) => {
  return useCache(
    `user-stats-${userId}`,
    async () => {
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase.rpc('get_user_stats', { user_id: userId });
      if (error) throw error;
      return data;
    },
    { ttl: 2 * 60 * 1000, staleWhileRevalidate: true } // 2 minutes
  );
};

export const useCachedBrandProfile = (userId: string) => {
  return useCache(
    `brand-profile-${userId}`,
    async () => {
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    { ttl: 10 * 60 * 1000, staleWhileRevalidate: true } // 10 minutes
  );
};

export const useCachedMarketingPlans = (userId: string) => {
  return useCache(
    `marketing-plans-${userId}`,
    async () => {
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase
        .from('marketing_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    { ttl: 5 * 60 * 1000, staleWhileRevalidate: true } // 5 minutes
  );
};