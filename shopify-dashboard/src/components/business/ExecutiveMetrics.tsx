import React from 'react';
import { MetricCard } from './MetricCard';
import { DollarSign, TrendingUp, Users, Briefcase } from 'lucide-react';

interface ExecutiveMetricsProps {
  annualRevenueRunRate: number;
  grossMargin: number;
  totalFollowers: number;
  monthlyBurnRate: number;
  isLoading: boolean;
}

/**
 * Executive Metrics Grid - Presentation component for CEO dashboard metrics
 * Separated from CEODashboard for better reusability and testing
 */
export const ExecutiveMetrics: React.FC<ExecutiveMetricsProps> = ({
  annualRevenueRunRate,
  grossMargin,
  totalFollowers,
  monthlyBurnRate,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard 
        title="Annual Revenue Run Rate" 
        value={annualRevenueRunRate > 0 ? `$${(annualRevenueRunRate / 1000000).toFixed(1)}M` : '$0'} 
        change={undefined} 
        icon={<DollarSign className="h-4 w-4" />} 
        variant="revenue" 
        isLoading={isLoading}
      />
      <MetricCard 
        title="Gross Margin" 
        value={grossMargin > 0 ? `${grossMargin.toFixed(1)}%` : '0%'} 
        change={undefined} 
        icon={<TrendingUp className="h-4 w-4" />} 
        variant="default" 
        isLoading={isLoading}
      />
      <MetricCard 
        title="Customer Acquisition" 
        value={totalFollowers > 0 ? totalFollowers.toLocaleString() : '0'} 
        change={undefined} 
        icon={<Users className="h-4 w-4" />} 
        variant="revenue" 
        isLoading={isLoading}
      />
      <MetricCard 
        title="Monthly Burn Rate" 
        value={monthlyBurnRate > 0 ? `$${(monthlyBurnRate / 1000).toFixed(0)}K` : '$0'} 
        change={undefined} 
        icon={<Briefcase className="h-4 w-4" />} 
        variant="expense" 
        isLoading={isLoading}
      />
    </div>
  );
};