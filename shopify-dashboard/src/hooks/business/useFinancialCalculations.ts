import { useMemo } from 'react';
import { useSupabaseQuery } from '../useSupabaseQuery';
import { FinancialRecord } from '@/types/business';
import { 
  calculateFinancialMetrics, 
  calculateGrowthMetrics, 
  generateRevenueByChannel 
} from '@/utils/calculations/financialCalculations';

/**
 * Hook for financial calculations - separated business logic from data fetching
 * Uses calculation utilities for clean separation of concerns
 */
export function useFinancialCalculations() {
  const { data: financialRecords = [], isLoading, error } = useSupabaseQuery<FinancialRecord>(
    ['financial-records'],
    'financial_records',
    '*'
  );

  const calculations = useMemo(() => {
    const metrics = calculateFinancialMetrics(financialRecords);
    const growthData = calculateGrowthMetrics(metrics.chartData);
    const revenueByChannel = generateRevenueByChannel(metrics.totalRevenue);

    // Categorize records for additional data needs
    const revenueRecords = financialRecords.filter(record => record.record_type === 'revenue');
    const expenseRecords = financialRecords.filter(record => record.record_type === 'expense');
    const googleSheetsRecords = financialRecords.filter(r => r.source === 'google_sheets');
    const quickbooksRecords = financialRecords.filter(r => r.source === 'quickbooks');

    return {
      ...metrics,
      growthData,
      revenueByChannel,
      revenueRecords,
      expenseRecords,
      googleSheetsRecords,
      quickbooksRecords
    };
  }, [financialRecords]);

  if (error) {
    console.error('Error loading financial data:', error);
  }

  return {
    financialRecords,
    isLoading,
    error,
    ...calculations
  };
}