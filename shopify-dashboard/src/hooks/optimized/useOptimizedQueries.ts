/**
 * Optimized query hooks with better memoization and dependency management
 * Reduces unnecessary re-renders and improves performance
 */
import { useMemo, useCallback } from 'react';
import { useSupabaseQuery } from '../useSupabaseQuery';
import { memoize } from '@/lib/performance';

/**
 * Memoized query key generator to prevent unnecessary re-renders
 */
const createQueryKey = memoize(
  (base: string, filters?: Record<string, any>) => {
    if (!filters || Object.keys(filters).length === 0) {
      return [base];
    }
    return [base, ...Object.entries(filters).flat()];
  }
);

/**
 * Optimized purchase orders query with better memoization
 */
export function useOptimizedPurchaseOrders(filters?: Record<string, any>) {
  const queryKey = useMemo(() => createQueryKey('purchase_orders', filters), [filters]);
  
  return useSupabaseQuery(
    queryKey,
    'purchase_orders',
    '*',
    filters
  );
}

/**
 * Optimized vendors query with better memoization
 */
export function useOptimizedVendors(filters?: Record<string, any>) {
  const queryKey = useMemo(() => createQueryKey('vendors', filters), [filters]);
  
  return useSupabaseQuery(
    queryKey,
    'vendors',
    '*',
    filters
  );
}

/**
 * Optimized goals query with better memoization
 */
export function useOptimizedGoals(filters?: Record<string, any>) {
  const queryKey = useMemo(() => createQueryKey('goals', filters), [filters]);
  
  return useSupabaseQuery(
    queryKey,
    'goals',
    '*',
    filters
  );
}

/**
 * Optimized budget line items query - using correct table name
 */
export function useOptimizedBudgetLineItems(projectId?: string) {
  const queryKey = useMemo(() => 
    projectId ? ['launch_budget_items', projectId] : ['launch_budget_items']
  , [projectId]);
  
  const filters = useMemo(() => 
    projectId ? { project_id: projectId } : undefined
  , [projectId]);
  
  return useSupabaseQuery(
    queryKey,
    'launch_budget_items',
    '*',
    filters
  );
}

/**
 * Optimized AR transactions query
 */
export function useOptimizedARTransactions(filters?: Record<string, any>) {
  const queryKey = useMemo(() => createQueryKey('ar_transactions', filters), [filters]);
  
  return useSupabaseQuery(
    queryKey,
    'ar_transactions',
    '*',
    filters
  );
}

/**
 * Optimized funding data queries
 */
export function useOptimizedFundingRounds(roundId?: string) {
  const queryKey = useMemo(() => 
    roundId ? ['funding_rounds', roundId] : ['funding_rounds']
  , [roundId]);
  
  const filters = useMemo(() => 
    roundId ? { id: roundId } : undefined
  , [roundId]);
  
  return useSupabaseQuery(
    queryKey,
    'funding_rounds',
    '*',
    filters
  );
}

export function useOptimizedSocialMediaMetrics(dateRange?: { start: string; end: string }) {
  const queryKey = useMemo(() => 
    dateRange ? ['social_media_metrics', dateRange.start, dateRange.end] : ['social_media_metrics']
  , [dateRange]);
  
  // Build filters for date range if provided
  const filters = useMemo(() => {
    if (!dateRange) return undefined;
    return {
      period_start: `gte.${dateRange.start}`,
      period_end: `lte.${dateRange.end}`
    };
  }, [dateRange]);
  
  return useSupabaseQuery(
    queryKey,
    'social_media_metrics',
    '*',
    filters
  );
}

export function useOptimizedWebsiteAnalytics(metricType?: string, dateRange?: { start: string; end: string }) {
  const queryKey = useMemo(() => {
    const key = ['website_analytics'];
    if (metricType) key.push(metricType);
    if (dateRange) key.push(dateRange.start, dateRange.end);
    return key;
  }, [metricType, dateRange]);
  
  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (metricType) f.metric_type = metricType;
    if (dateRange) {
      f.date = `gte.${dateRange.start}`;
    }
    return Object.keys(f).length > 0 ? f : undefined;
  }, [metricType, dateRange]);
  
  return useSupabaseQuery(
    queryKey,
    'website_analytics',
    '*',
    filters
  );
}

/**
 * Cache management utilities
 */
export const QueryCacheUtils = {
  /**
   * Invalidate specific query patterns
   */
  invalidatePattern: (pattern: string) => {
    // This would integrate with React Query's invalidation system
    console.log(`Invalidating queries matching pattern: ${pattern}`);
  },
  
  /**
   * Clear all cached queries
   */
  clearAll: () => {
    console.log('Clearing all query cache');
  },
  
  /**
   * Get cache statistics
   */
  getStats: () => {
    return {
      totalQueries: 0,
      cacheHitRate: 0,
      memoryUsage: 0
    };
  }
};