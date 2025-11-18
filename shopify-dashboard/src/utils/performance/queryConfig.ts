import { QueryClient } from '@tanstack/react-query';

// Optimized query configuration for pricing optimization performance
export const defaultQueryConfig = {
  queries: {
    // Extended cache times for pricing data that doesn't change frequently
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Retry failed requests with exponential backoff
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
};

// Create optimized query client
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: defaultQueryConfig,
  });
};

// Common query keys for consistency
export const QUERY_KEYS = {
  // Financial data
  FINANCIAL_RECORDS: ['financial-records'],
  FINANCIAL_RECORDS_BY_TYPE: (type: string) => ['financial-records', type],
  
  // Social media
  SOCIAL_MEDIA_METRICS: ['social-media-metrics'],
  SOCIAL_MEDIA_BY_PLATFORM: (platform: string) => ['social-media-metrics', platform],
  
  // Inventory
  SHOPIFY_ORDERS: ['shopify-orders'],
  SKU_COST_DETAILS: ['sku-cost-details'],
  
  // Analytics
  WEBSITE_ANALYTICS: ['website-analytics'],
  
  // Business aggregations
  BUSINESS_DATA: ['business-data'],
  INVENTORY_DATA: ['inventory-data'],
  
  // Pricing optimization
  PRICING_SCENARIOS: (userId: string) => ['pricing-scenarios', userId],
  PRICING_RECOMMENDATIONS: (userId: string) => ['pricing-recommendations', userId],
  PRICING_INSIGHTS: (userId: string) => ['pricing-insights', userId],
} as const;