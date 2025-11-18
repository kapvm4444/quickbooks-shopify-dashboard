import React, { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface RevenueChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

interface GrowthChartProps {
  data: Array<{ month: string; growth: number }>;
}

/**
 * Memoized Revenue Chart - Only re-renders when data changes
 */
export const RevenueChart = memo<RevenueChartProps>(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">No revenue data available</p>
          <p className="text-xs mt-1">Connect your data sources to see revenue breakdown</p>
        </div>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={value => `${value}%`} />
      </PieChart>
    </ResponsiveContainer>
  );
});
RevenueChart.displayName = 'RevenueChart';

/**
 * Memoized Growth Chart - Only re-renders when data changes
 */
export const GrowthChart = memo<GrowthChartProps>(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">No growth data available</p>
          <p className="text-xs mt-1">Financial data will appear here once connected</p>
        </div>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={value => [`${value}%`, 'Growth Rate']} />
        <Bar dataKey="growth" fill="hsl(var(--financial-revenue))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});
GrowthChart.displayName = 'GrowthChart';