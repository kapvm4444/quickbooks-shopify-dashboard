import { useMemo } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { FinancialRecord } from '@/types/business';
import { addMonths, format, startOfMonth, endOfMonth, isAfter, isBefore, addDays, addWeeks, addQuarters, addYears } from 'date-fns';

interface CashFlowProjection {
  month: string;
  inflow: number;
  outflow: number;
  balance: number;
  recurringExpenses: number;
  oneTimeExpenses: number;
}

interface RecurringExpense extends FinancialRecord {
  is_recurring: boolean;
  recurrence_pattern: string | null;
  recurrence_day: number | null;
  next_due_date: string | null;
  end_date: string | null;
}

const generateRecurringExpenses = (
  recurringExpense: RecurringExpense,
  monthsToProject: number = 12
): Array<{ date: Date; amount: number }> => {
  if (!recurringExpense.is_recurring || !recurringExpense.recurrence_pattern || !recurringExpense.recurrence_day) {
    return [];
  }

  const projections: Array<{ date: Date; amount: number }> = [];
  const startDate = recurringExpense.next_due_date 
    ? new Date(recurringExpense.next_due_date)
    : new Date(recurringExpense.transaction_date);
  
  const endProjectionDate = addMonths(new Date(), monthsToProject);
  const expenseEndDate = recurringExpense.end_date ? new Date(recurringExpense.end_date) : null;

  let currentDate = startDate;

  while (isBefore(currentDate, endProjectionDate)) {
    // Check if we've passed the expense end date
    if (expenseEndDate && isAfter(currentDate, expenseEndDate)) {
      break;
    }

    projections.push({
      date: new Date(currentDate),
      amount: Math.abs(recurringExpense.amount), // Ensure positive for expenses
    });

    // Calculate next occurrence based on pattern
    switch (recurringExpense.recurrence_pattern) {
      case 'weekly':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'quarterly':
        currentDate = addQuarters(currentDate, 1);
        break;
      case 'yearly':
        currentDate = addYears(currentDate, 1);
        break;
      default:
        // Unknown pattern, stop projecting
        break;
    }
  }

  return projections;
};

export function useCashFlowData(monthsToProject: number = 12) {
  const { data: financialRecords = [], isLoading } = useSupabaseQuery<RecurringExpense>(
    ['financial-records-cashflow'],
    'financial_records',
    '*'
  );

  const cashFlowProjections = useMemo(() => {
    const projections: CashFlowProjection[] = [];
    const currentDate = new Date();
    
    // Generate projections for the next N months
    for (let i = 0; i < monthsToProject; i++) {
      const monthDate = addMonths(currentDate, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthKey = format(monthDate, 'MMM yyyy');

      // Get historical data for this month (if it's in the past)
      const historicalRevenue = financialRecords
        .filter(record => {
          const recordDate = new Date(record.transaction_date);
          return record.record_type === 'revenue' &&
                 recordDate >= monthStart && 
                 recordDate <= monthEnd;
        })
        .reduce((total, record) => total + Math.abs(record.amount), 0);

      const historicalExpenses = financialRecords
        .filter(record => {
          const recordDate = new Date(record.transaction_date);
          return record.record_type === 'expense' &&
                 !record.is_recurring && // Only one-time expenses
                 recordDate >= monthStart && 
                 recordDate <= monthEnd;
        })
        .reduce((total, record) => total + Math.abs(record.amount), 0);

      // Calculate projected recurring expenses for this month
      const recurringExpenses = financialRecords
        .filter(record => record.is_recurring && record.record_type === 'expense')
        .reduce((total, recurringExpense) => {
          const projections = generateRecurringExpenses(recurringExpense, monthsToProject);
          const monthlyAmount = projections
            .filter(p => {
              return p.date >= monthStart && p.date <= monthEnd;
            })
            .reduce((sum, p) => sum + p.amount, 0);
          return total + monthlyAmount;
        }, 0);

      const totalInflow = historicalRevenue;
      const totalOutflow = historicalExpenses + recurringExpenses;

      projections.push({
        month: monthKey,
        inflow: totalInflow,
        outflow: totalOutflow,
        balance: totalInflow - totalOutflow,
        recurringExpenses,
        oneTimeExpenses: historicalExpenses,
      });
    }

    // Calculate running balance
    let runningBalance = 0;
    return projections.map(projection => {
      runningBalance += projection.balance;
      return {
        ...projection,
        balance: runningBalance,
      };
    });
  }, [financialRecords, monthsToProject]);

  const summary = useMemo(() => {
    const totalRecurringMonthly = financialRecords
      .filter(record => record.is_recurring && record.record_type === 'expense')
      .reduce((total, record) => {
        // Calculate monthly equivalent
        const monthlyAmount = (() => {
          switch (record.recurrence_pattern) {
            case 'weekly': return Math.abs(record.amount) * 4.33; // ~4.33 weeks per month
            case 'monthly': return Math.abs(record.amount);
            case 'quarterly': return Math.abs(record.amount) / 3;
            case 'yearly': return Math.abs(record.amount) / 12;
            default: return 0;
          }
        })();
        return total + monthlyAmount;
      }, 0);

    const currentBalance = cashFlowProjections[0]?.balance || 0;
    const projectedBalance6Months = cashFlowProjections[5]?.balance || 0;
    const projectedBalance12Months = cashFlowProjections[11]?.balance || 0;

    return {
      totalRecurringMonthly,
      currentBalance,
      projectedBalance6Months,
      projectedBalance12Months,
      recurringExpenseCount: financialRecords.filter(r => r.is_recurring).length,
    };
  }, [financialRecords, cashFlowProjections]);

  return {
    cashFlowProjections,
    summary,
    isLoading,
  };
}