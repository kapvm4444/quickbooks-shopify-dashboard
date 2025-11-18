import { useMemo } from "react";
import { FinancialRecord } from "@/types/business";
import { FilterState } from "@/components/common/UnifiedFilterToolbar";

export function useUnifiedFilters(
  transactions: FinancialRecord[],
  filters: FilterState
) {
  const filteredTransactions = useMemo(() => {
    if (!transactions?.length) return [];
    
    return transactions.filter((transaction) => {
      // Payee filter
      if (filters.payeeSearch) {
        const payee = (transaction.payee || '').toLowerCase();
        if (!payee.includes(filters.payeeSearch.toLowerCase())) {
          return false;
        }
      }

      // Description filter
      if (filters.descriptionSearch) {
        const description = (transaction.description || '').toLowerCase();
        if (!description.includes(filters.descriptionSearch.toLowerCase())) {
          return false;
        }
      }

      // Chart account filter
      if (filters.chartAccountCode) {
        if (filters.chartAccountCode === 'uncategorized') {
          if (transaction.chart_account_code) return false;
        } else {
          if (transaction.chart_account_code !== filters.chartAccountCode) {
            return false;
          }
        }
      }

      // Amount range filter
      const amount = Number(transaction.amount);
      if (filters.minAmount && amount < Number(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && amount > Number(filters.maxAmount)) {
        return false;
      }

      // Date range filter
      const transactionDate = new Date(transaction.transaction_date);
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (transactionDate < startDate) return false;
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (transactionDate > endDate) return false;
      }

      // Recurring filter
      if (filters.recurringFilter === 'recurring' && !transaction.is_recurring) {
        return false;
      }
      if (filters.recurringFilter === 'one-time' && transaction.is_recurring) {
        return false;
      }

      return true;
    });
  }, [transactions, filters]);

  return { filteredTransactions };
}