import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface QueryOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
}

interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

export const useOptimizedQuery = <T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): QueryResult<T> => {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    refetchInterval,
    staleTime = 5 * 60 * 1000, // 5 minutes
    retry = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const isStale = Date.now() - lastFetch > staleTime;

  const executeQuery = useCallback(async (isRetry = false) => {
    if (!enabled) return;

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
        retryCountRef.current = 0;
      }

      const result = await queryFn();
      setData(result);
      setLastFetch(Date.now());
      retryCountRef.current = 0;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Query failed');
      
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        const delay = retryDelay * Math.pow(2, retryCountRef.current - 1); // Exponential backoff
        
        timeoutRef.current = setTimeout(() => {
          executeQuery(true);
        }, delay);
      } else {
        setError(error);
        console.error(`Query ${queryKey} failed after ${retry} retries:`, error);
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  }, [queryKey, queryFn, enabled, retry, retryDelay]);

  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await executeQuery();
  }, [executeQuery]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      executeQuery();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [executeQuery, enabled]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      if (!document.hidden) { // Only refetch if tab is visible
        executeQuery();
      }
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, executeQuery]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;

    const handleFocus = () => {
      if (isStale) {
        executeQuery();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, enabled, isStale, executeQuery]);

  return {
    data,
    loading,
    error,
    refetch,
    isStale
  };
};

// Specialized hooks for common Supabase queries
export const useOptimizedSupabaseQuery = <T>(
  table: string,
  queryBuilder: (query: any) => any,
  dependencies: any[] = [],
  options: QueryOptions = {}
) => {
  const queryFn = useCallback(async () => {
    const query = supabase.from(table).select();
    const { data, error } = await queryBuilder(query);
    if (error) throw error;
    return data as T;
  }, [table, queryBuilder, ...dependencies]);

  return useOptimizedQuery(
    `${table}-${JSON.stringify(dependencies)}`,
    queryFn,
    options
  );
};

export const useOptimizedRPCQuery = <T>(
  functionName: string,
  params: Record<string, any> = {},
  options: QueryOptions = {}
) => {
  const queryFn = useCallback(async () => {
    const { data, error } = await supabase.rpc(functionName, params);
    if (error) throw error;
    return data as T;
  }, [functionName, JSON.stringify(params)]);

  return useOptimizedQuery(
    `rpc-${functionName}-${JSON.stringify(params)}`,
    queryFn,
    options
  );
};

// Hook for optimized mutations with cache invalidation
export const useOptimizedMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[];
  } = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);

      const data = await mutationFn(variables);
      
      options.onSuccess?.(data, variables);
      
      // Invalidate specified queries
      if (options.invalidateQueries) {
        const { useCacheInvalidation } = await import('./useCache');
        const { invalidatePattern } = useCacheInvalidation();
        
        options.invalidateQueries.forEach(pattern => {
          invalidatePattern(pattern);
        });
      }

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed');
      setError(error);
      options.onError?.(error, variables);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return {
    mutate,
    loading,
    error
  };
};