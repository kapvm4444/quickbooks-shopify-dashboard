/**
 * Shared Financial Data Context
 * Centralizes financial_records queries to eliminate duplicates and improve performance
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { FinancialRecord } from '@/types/business';
import { 
  calculateFinancialMetrics, 
  calculateGrowthMetrics, 
  generateRevenueByChannel 
} from '@/utils/calculations/financialCalculations';
import { combineLoadingStates } from '@/lib/loading';

interface FinancialDataContextValue {
  // Raw data
  allRecords: FinancialRecord[];
  financialRecords: FinancialRecord[]; // Legacy compatibility alias
  isLoading: boolean;
  error: any;
  refetch: () => void;
  
  // Filtered data for specific use cases
  revenueRecords: FinancialRecord[];
  expenseRecords: FinancialRecord[];
  skuRecords: FinancialRecord[];
  googleSheetsRecords: FinancialRecord[];
  quickbooksRecords: FinancialRecord[];
  
  // Calculated metrics (from useFinancialCalculations)
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossMargin: number;
  chartData: any[];
  growthData: any;
  revenueByChannel: any[];
}

const FinancialDataContext = createContext<FinancialDataContextValue | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: React.ReactNode }) {
  // Single query for all financial records
  const { data: allRecords = [], isLoading, error, refetch } = useSupabaseQuery<FinancialRecord>(
    ['financial-records-all'],
    'financial_records',
    '*'
  );

  const contextValue = useMemo(() => {
    console.log('FinancialDataContext: Processing records', {
      totalRecords: allRecords.length,
      allRecords: allRecords.map(r => ({ 
        id: r.id, 
        record_type: r.record_type, 
        amount: r.amount, 
        source: r.source 
      }))
    });

    // Filter records by type for different use cases
    const revenueRecords = allRecords.filter(record => record.record_type === 'revenue');
    const expenseRecords = allRecords.filter(record => record.record_type === 'expense');
    const skuRecords = allRecords.filter(record => record.record_type === 'sku');
    const googleSheetsRecords = allRecords.filter(r => r.source === 'google_sheets');
    const quickbooksRecords = allRecords.filter(r => r.source === 'quickbooks');

    console.log('FinancialDataContext: Filtered records', {
      revenueCount: revenueRecords.length,
      revenueTotal: revenueRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
      expenseCount: expenseRecords.length,
      skuCount: skuRecords.length,
      googleSheetsCount: googleSheetsRecords.length,
      quickbooksCount: quickbooksRecords.length
    });

    // Calculate metrics once for all consumers
    const metrics = calculateFinancialMetrics(allRecords);
    const growthData = calculateGrowthMetrics(metrics.chartData);
    const revenueByChannel = generateRevenueByChannel(metrics.totalRevenue);

    return {
      // Raw data
      allRecords,
      financialRecords: allRecords, // Legacy compatibility alias
      isLoading,
      error,
      refetch,
      
      // Filtered data
      revenueRecords,
      expenseRecords,
      skuRecords,
      googleSheetsRecords,
      quickbooksRecords,
      
      // Calculated metrics
      totalRevenue: metrics.totalRevenue,
      totalExpenses: metrics.totalExpenses,
      netProfit: metrics.netProfit,
      grossMargin: metrics.grossMargin,
      chartData: metrics.chartData,
      growthData,
      revenueByChannel
    };
  }, [allRecords, isLoading, error, refetch]);

  return (
    <FinancialDataContext.Provider value={contextValue}>
      {children}
    </FinancialDataContext.Provider>
  );
}

/**
 * Hook to access financial data context
 */
export function useFinancialDataContext() {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error('useFinancialDataContext must be used within a FinancialDataProvider');
  }
  return context;
}

/**
 * Optimized hook for financial calculations - now uses shared context
 */
export function useOptimizedFinancialCalculations() {
  return useFinancialDataContext();
}

/**
 * Optimized hook for SKU records from financial data
 */
export function useOptimizedSKURecords() {
  const { skuRecords, isLoading, error } = useFinancialDataContext();
  return { data: skuRecords, isLoading, error };
}

/**
 * Optimized hook for expense records from financial data
 */
export function useOptimizedExpenseRecords() {
  const { expenseRecords, isLoading, error } = useFinancialDataContext();
  return { data: expenseRecords, isLoading, error };
}