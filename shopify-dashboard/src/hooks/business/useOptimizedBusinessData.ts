import { useMemo } from 'react';
import { useSupabaseQuery } from '../useSupabaseQuery';
import { SocialMediaMetric } from '@/types/business';
import { useOptimizedInventoryData } from '@/contexts/InventoryDataContext';
import { combineLoadingStates, hasAnyError, getFirstError } from '@/lib/loading';

interface WebsiteAnalytic {
  id: string;
  source: string;
  metric_type: string;
  metric_value: number;
  date: string;
  page_path?: string;
  dimensions?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Optimized business data hook - now uses shared contexts and optimized queries
 */
export function useOptimizedBusinessData() {
  // Use optimized queries with proper typing
  const { data: socialMetrics = [], isLoading: socialLoading, error: socialError } = useSupabaseQuery<SocialMediaMetric>(
    ['social-media-metrics'],
    'social_media_metrics',
    '*'
  );
  
  const { skuList, totalSKUs, totalInventoryValue, totalUnits, inventoryByCategory, isLoading: inventoryLoading } = useOptimizedInventoryData();
  
  const { data: websiteData = [], isLoading: analyticsLoading, error: analyticsError } = useSupabaseQuery<WebsiteAnalytic>(
    ['website-analytics'],
    'website_analytics',
    '*'
  );

  // Combine loading states efficiently
  const isLoading = combineLoadingStates(socialLoading, inventoryLoading, analyticsLoading);
  const hasError = hasAnyError(socialError as Error, analyticsError as Error);
  const firstError = getFirstError(socialError as Error, analyticsError as Error);

  // Memoize calculations for performance
  const businessMetrics = useMemo(() => {
    // Social Media aggregations
    const platformData = socialMetrics.reduce((acc, metric) => {
      const platform = metric.platform;
      if (!acc[platform]) {
        acc[platform] = { platform, followers: 0, engagement: 0, reach: 0, posts: 0 };
      }
      
      switch (metric.metric_type) {
        case 'followers':
          acc[platform].followers += Number(metric.metric_value);
          break;
        case 'engagement':
          acc[platform].engagement += Number(metric.metric_value);
          break;
        case 'reach':
          acc[platform].reach += Number(metric.metric_value);
          break;
        case 'posts':
          acc[platform].posts += Number(metric.metric_value);
          break;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const totalFollowers = Object.values(platformData).reduce((sum: number, data: any) => sum + data.followers, 0);
    const averageEngagement = Object.values(platformData).length > 0 
      ? Object.values(platformData).reduce((sum: number, data: any) => sum + data.engagement, 0) / Object.values(platformData).length
      : 0;
    const totalReach = Object.values(platformData).reduce((sum: number, data: any) => sum + data.reach, 0);

    // Website Analytics aggregations
    const websiteTraffic = websiteData.filter(w => w.metric_type === 'page_views');
    const conversionData = websiteData.filter(w => w.metric_type === 'conversions');
    
    const totalPageViews = websiteTraffic.reduce((sum, item) => sum + item.metric_value, 0);
    const totalConversions = conversionData.reduce((sum, item) => sum + item.metric_value, 0);
    const conversionRate = totalPageViews > 0 ? (totalConversions / totalPageViews) * 100 : 0;

    // Generate chart data for social engagement over time
    const chartData = socialMetrics
      .filter(metric => metric.metric_type === 'engagement')
      .map(metric => ({
        date: metric.period_start,
        engagement: metric.metric_value,
        platform: metric.platform
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      // Social Media
      socialMediaMetrics: socialMetrics,
      platformData: Object.values(platformData),
      totalFollowers,
      averageEngagement,
      totalReach,
      chartData,
      
      // Inventory/SKU (from shared context)
      skuList,
      totalSKUs,
      totalInventoryValue,
      totalUnits,
      inventoryByCategory,
      
      // Website Analytics
      websiteAnalytics: websiteData,
      websiteTraffic,
      conversionData,
      totalPageViews,
      totalConversions,
      conversionRate,
      
      // Aggregated metrics for legacy compatibility
      totalPosts: Object.values(platformData).reduce((sum: number, data: any) => sum + data.posts, 0),
      socialEngagementData: chartData
    };
  }, [socialMetrics, skuList, websiteData, totalSKUs, totalInventoryValue, totalUnits, inventoryByCategory]);

  return {
    // Loading and error states
    isLoading,
    hasError,
    error: firstError,
    
    // All business metrics
    ...businessMetrics
  };
}

/**
 * Legacy compatibility export
 */
export { useOptimizedBusinessData as useBusinessData };