import { useMemo } from 'react';
import { useSupabaseQuery } from '../useSupabaseQuery';

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

export function useWebsiteAnalytics() {
  const { data: websiteAnalytics = [], isLoading, error } = useSupabaseQuery<WebsiteAnalytic>(
    ['website-analytics'],
    'website_analytics',
    '*'
  );

  const calculations = useMemo(() => {
    if (!websiteAnalytics.length) {
      return {
        websiteTraffic: [],
        conversionData: [],
        totalPageViews: 0,
        totalConversions: 0,
        conversionRate: 0
      };
    }

    const websiteTraffic = websiteAnalytics.filter(w => w.metric_type === 'page_views');
    const conversionData = websiteAnalytics.filter(w => w.metric_type === 'conversions');

    const totalPageViews = websiteTraffic.reduce((sum, item) => sum + item.metric_value, 0);
    const totalConversions = conversionData.reduce((sum, item) => sum + item.metric_value, 0);
    const conversionRate = totalPageViews > 0 ? (totalConversions / totalPageViews) * 100 : 0;

    return {
      websiteTraffic,
      conversionData,
      totalPageViews,
      totalConversions,
      conversionRate
    };
  }, [websiteAnalytics]);

  return {
    websiteAnalytics,
    isLoading,
    error,
    ...calculations
  };
}