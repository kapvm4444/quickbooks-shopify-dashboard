import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Repeat, Play, Pause, Edit, Trash2, Plus } from "lucide-react";
import { FinancialRecord } from "@/types/business";
import { formatCurrency } from "@/utils/formatters/numberFormatters";
import { format, addWeeks, addMonths, addQuarters, addYears, isBefore, parseISO } from "date-fns";

interface RecurringExpensesWidgetProps {
  expenseRecords: FinancialRecord[];
  onAddRecurring?: () => void;
  onEditRecurring?: (record: FinancialRecord) => void;
  onDeleteRecurring?: (recordId: string) => void;
}

interface RecurringExpenseWithNext extends FinancialRecord {
  nextDueDate: Date;
  isOverdue: boolean;
}

export function RecurringExpensesWidget({ 
  expenseRecords, 
  onAddRecurring, 
  onEditRecurring, 
  onDeleteRecurring 
}: RecurringExpensesWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const recurringData = useMemo(() => {
    const recurringExpenses = expenseRecords.filter(record => record.is_recurring);
    
    // Calculate next due dates for recurring expenses
    const recurringWithDates: RecurringExpenseWithNext[] = recurringExpenses.map(record => {
      const nextDueDate = calculateNextDueDate(record);
      const isOverdue = isBefore(nextDueDate, new Date());
      
      return {
        ...record,
        nextDueDate,
        isOverdue
      };
    });

    // Sort by next due date
    const sortedRecurring = recurringWithDates.sort((a, b) => 
      a.nextDueDate.getTime() - b.nextDueDate.getTime()
    );

    // Calculate totals
    const totalRecurring = recurringExpenses.length;
    const monthlyTotal = recurringExpenses.reduce((sum, record) => {
      if (record.recurrence_pattern === 'monthly') {
        return sum + Number(record.amount);
      } else if (record.recurrence_pattern === 'weekly') {
        return sum + (Number(record.amount) * 4.33); // Average weeks per month
      } else if (record.recurrence_pattern === 'quarterly') {
        return sum + (Number(record.amount) / 3);
      } else if (record.recurrence_pattern === 'yearly') {
        return sum + (Number(record.amount) / 12);
      }
      return sum + Number(record.amount); // Default to monthly
    }, 0);

    const nextDue = sortedRecurring.length > 0 ? sortedRecurring[0].nextDueDate : null;
    const upcomingExpenses = sortedRecurring.slice(0, 6); // Show next 6 expenses
    const overdueCount = sortedRecurring.filter(r => r.isOverdue).length;

    return {
      totalRecurring,
      monthlyTotal,
      nextDue,
      upcomingExpenses,
      overdueCount
    };
  }, [expenseRecords]);

  const formatRecurrencePattern = (pattern: string | null) => {
    if (!pattern) return 'Monthly';
    return pattern.charAt(0).toUpperCase() + pattern.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            Recurring Expenses
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Metrics - Always Visible */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {recurringData.totalRecurring}
                {recurringData.overdueCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {recurringData.overdueCount} overdue
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Active recurring</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(recurringData.monthlyTotal)}
              </div>
              <p className="text-sm text-muted-foreground">Monthly total</p>
            </div>
          </div>

          {recurringData.nextDue && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">Next due:</p>
              <p className="text-sm text-muted-foreground">
                {format(recurringData.nextDue, 'MMM dd, yyyy')}
              </p>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onAddRecurring}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Recurring Expense
          </Button>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Upcoming Expenses</h4>
                <span className="text-xs text-muted-foreground">
                  Next {Math.min(6, recurringData.upcomingExpenses.length)} items
                </span>
              </div>
              
              {recurringData.upcomingExpenses.length > 0 ? (
                <div className="space-y-2">
                  {recurringData.upcomingExpenses.map((expense) => (
                    <div 
                      key={expense.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        expense.isOverdue 
                          ? 'border-destructive/20 bg-destructive/5' 
                          : 'border-border bg-background'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {expense.description}
                          </p>
                          {expense.isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm font-semibold">
                            {formatCurrency(expense.amount)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRecurrencePattern(expense.recurrence_pattern)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Due: {format(expense.nextDueDate, 'MMM dd')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditRecurring?.(expense)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteRecurring?.(expense.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Repeat className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No recurring expenses set up yet
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate next due date based on recurrence pattern
function calculateNextDueDate(record: FinancialRecord): Date {
  const lastDate = record.next_due_date 
    ? parseISO(record.next_due_date)
    : parseISO(record.transaction_date);
  
  const today = new Date();
  let nextDate = lastDate;

  // If the last date is in the past, calculate the next occurrence
  while (isBefore(nextDate, today)) {
    switch (record.recurrence_pattern) {
      case 'weekly':
        nextDate = addWeeks(nextDate, 1);
        break;
      case 'monthly':
        nextDate = addMonths(nextDate, 1);
        break;
      case 'quarterly':
        nextDate = addQuarters(nextDate, 1);
        break;
      case 'yearly':
        nextDate = addYears(nextDate, 1);
        break;
      default:
        nextDate = addMonths(nextDate, 1); // Default to monthly
    }
  }

  return nextDate;
}