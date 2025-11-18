/**
 * Financial calculation utilities
 * Centralized business logic for financial calculations
 */

import { FinancialRecord } from '@/types/business';

export interface FinancialCalculations {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossMargin: number;
  annualRevenueRunRate: number;
  monthlyBurnRate: number;
  chartData: Array<{ month: string; revenue: number; expenses: number }>;
}

/**
 * Calculate financial metrics from financial records
 */
export function calculateFinancialMetrics(records: FinancialRecord[]): FinancialCalculations {
  if (!records.length) {
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      grossMargin: 0,
      annualRevenueRunRate: 0,
      monthlyBurnRate: 0,
      chartData: []
    };
  }

  const revenueRecords = records.filter(record => record.record_type === 'revenue');
  const expenseRecords = records.filter(record => record.record_type === 'expense');
  
  const totalRevenue = revenueRecords.reduce((sum, record) => sum + Number(record.amount), 0);
  const totalExpenses = expenseRecords.reduce((sum, record) => sum + Number(record.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  
  // Business metrics
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
  const annualRevenueRunRate = totalRevenue * 12;
  const monthlyBurnRate = totalExpenses;

  // Group by month for chart data
  const monthlyData = records.reduce((acc, record) => {
    const date = new Date(record.transaction_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, revenue: 0, expenses: 0 };
    }
    
    if (record.record_type === 'revenue') {
      acc[monthKey].revenue += Number(record.amount);
    } else if (record.record_type === 'expense') {
      acc[monthKey].expenses += Number(record.amount);
    }
    
    return acc;
  }, {} as Record<string, { month: string; revenue: number; expenses: number }>);

  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    grossMargin,
    annualRevenueRunRate,
    monthlyBurnRate,
    chartData
  };
}

/**
 * Calculate growth metrics from financial data
 */
export function calculateGrowthMetrics(chartData: Array<{ month: string; revenue: number; expenses: number }>) {
  return chartData.map((item, index) => ({
    month: new Date(item.month).toLocaleString('en-US', { month: 'short' }),
    growth: index > 0 ? ((item.revenue - chartData[index - 1].revenue) / chartData[index - 1].revenue) * 100 : 0
  }));
}

/**
 * Generate revenue breakdown by channel
 */
export function generateRevenueByChannel(totalRevenue: number) {
  if (totalRevenue === 0) return [];
  
  return [
    { name: 'Primary Revenue', value: 100, color: '#2563eb' }
  ];
}