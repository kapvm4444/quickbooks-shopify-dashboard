import { SocialMediaMetric } from '@/types/business';

export function generateTimeSeriesData(metrics: SocialMediaMetric[]) {
  // Group metrics by month and aggregate
  const monthlyData = metrics.reduce((acc, metric) => {
    const date = new Date(metric.period_start);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        likes: 0,
        comments: 0,
        shares: 0,
        followers: 0,
        engagement: 0,
        reach: 0
      };
    }
    
    // Aggregate different metric types
    switch (metric.metric_type.toLowerCase()) {
      case 'likes':
        acc[monthKey].likes += Number(metric.metric_value);
        break;
      case 'comments':
        acc[monthKey].comments += Number(metric.metric_value);
        break;
      case 'shares':
        acc[monthKey].shares += Number(metric.metric_value);
        break;
      case 'followers':
        acc[monthKey].followers = Number(metric.metric_value); // Latest value
        break;
      case 'engagement_rate':
        acc[monthKey].engagement = Number(metric.metric_value);
        break;
      case 'reach':
        acc[monthKey].reach += Number(metric.metric_value);
        break;
    }
    
    return acc;
  }, {} as Record<string, any>);

  // Convert to array and sort by date
  return Object.values(monthlyData).sort((a: any, b: any) => {
    const dateA = new Date(`${a.month} 1, 2024`);
    const dateB = new Date(`${b.month} 1, 2024`);
    return dateA.getTime() - dateB.getTime();
  });
}

export function calculateEngagementRate(likes: number, comments: number, shares: number, followers: number): number {
  if (followers === 0) return 0;
  const totalEngagement = likes + comments + shares;
  return (totalEngagement / followers) * 100;
}

export function getPlatformColors(): Record<string, string> {
  return {
    facebook: '#1877F2',
    instagram: '#E4405F',
    twitter: '#1DA1F2',
    tiktok: '#000000',
    youtube: '#FF0000',
    linkedin: '#0A66C2',
    default: '#6B7280'
  };
}