import { useMemo } from 'react';
import { useSupabaseQuery } from '../useSupabaseQuery';
import { SocialMediaMetric } from '@/types/business';
import { generateTimeSeriesData } from '@/utils/calculations/socialMediaTransformations';

export function useSocialMediaMetrics() {
  const { data: socialMediaMetrics = [], isLoading, error } = useSupabaseQuery<SocialMediaMetric>(
    ['social-media-metrics'],
    'social_media_metrics',
    '*'
  );

  const calculations = useMemo(() => {
    if (!socialMediaMetrics.length) {
      return {
        platformData: [],
        totalFollowers: 0,
        averageEngagement: 0,
        totalReach: 0,
        chartData: []
      };
    }

    // Group metrics by platform
    const socialPlatformData = socialMediaMetrics.reduce((acc, metric) => {
      const platform = metric.platform;
      if (!acc[platform]) {
        acc[platform] = {
          name: platform,
          platform,
          followers: 0,
          engagement: 0,
          reach: 0,
          metrics: []
        };
      }
      
      // Update platform metrics based on type
      switch (metric.metric_type) {
        case 'followers':
          acc[platform].followers = Number(metric.metric_value);
          break;
        case 'engagement_rate':
          acc[platform].engagement = Number(metric.metric_value);
          break;
        case 'reach':
          acc[platform].reach = Number(metric.metric_value);
          break;
      }
      
      acc[platform].metrics.push(metric);
      return acc;
    }, {} as Record<string, any>);

    const platformData = Object.values(socialPlatformData);
    
    // Calculate aggregated metrics
    const totalFollowers = platformData.reduce(
      (sum: number, platform: any) => sum + (platform.followers || 0), 0
    );
    
    const averageEngagement = platformData.length > 0
      ? platformData.reduce(
          (sum: number, platform: any) => sum + (platform.engagement || 0), 0
        ) / platformData.length
      : 0;

    const totalReach = platformData.reduce(
      (sum: number, platform: any) => sum + (platform.reach || 0), 0
    );

    // Generate chart data from real metrics
    const chartData = socialMediaMetrics.length > 0 ? 
      generateTimeSeriesData(socialMediaMetrics) : [];

    return {
      platformData,
      totalFollowers,
      averageEngagement,
      totalReach,
      chartData
    };
  }, [socialMediaMetrics]);

  return {
    socialMediaMetrics,
    isLoading,
    error,
    ...calculations
  };
}