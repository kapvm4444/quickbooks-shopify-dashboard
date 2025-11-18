import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { addDays, format, isWithinInterval } from 'date-fns';

interface CashFlowProjection {
  month: string;
  inflow: number;
  outflow: number;
  balance: number;
  recurringExpenses: number;
  oneTimeExpenses: number;
}

interface CashFlowNotificationsProps {
  projections: CashFlowProjection[];
  recurringExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    next_due_date: string | null;
    recurrence_pattern: string | null;
  }>;
}

export function CashFlowNotifications({ projections, recurringExpenses }: CashFlowNotificationsProps) {
  const notifications = useMemo(() => {
    const alerts: Array<{
      type: 'destructive' | 'default';
      title: string;
      description: string;
      icon: React.ReactNode;
    }> = [];

    // Check for negative cash flow projections
    const negativeMonths = projections.filter(p => p.balance < 0);
    if (negativeMonths.length > 0) {
      const firstNegative = negativeMonths[0];
      alerts.push({
        type: 'destructive',
        title: 'Negative Cash Flow Alert',
        description: `Your cash balance is projected to go negative in ${firstNegative.month}. Consider adjusting expenses or increasing revenue.`,
        icon: <AlertTriangle className="h-4 w-4" />,
      });
    }

    // Check for declining cash flow trend
    if (projections.length >= 3) {
      const last3Months = projections.slice(-3);
      const isDeclined = last3Months.every((month, index) => {
        if (index === 0) return true;
        return month.balance < last3Months[index - 1].balance;
      });

      if (isDeclined && !negativeMonths.length) {
        alerts.push({
          type: 'default',
          title: 'Declining Cash Flow Trend',
          description: 'Your cash balance has been declining for the past 3 months. Monitor expenses closely.',
          icon: <TrendingDown className="h-4 w-4" />,
        });
      }
    }

    // Check for upcoming large expenses (next 30 days)
    const today = new Date();
    const next30Days = addDays(today, 30);
    
    const upcomingExpenses = recurringExpenses.filter(expense => {
      if (!expense.next_due_date) return false;
      const dueDate = new Date(expense.next_due_date);
      return isWithinInterval(dueDate, { start: today, end: next30Days });
    });

    if (upcomingExpenses.length > 0) {
      const totalUpcoming = upcomingExpenses.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
      alerts.push({
        type: 'default',
        title: 'Upcoming Recurring Expenses',
        description: `${upcomingExpenses.length} recurring expenses totaling $${totalUpcoming.toLocaleString()} are due in the next 30 days.`,
        icon: <Calendar className="h-4 w-4" />,
      });
    }

    // Check for high recurring expense ratio
    const currentBalance = projections[0]?.balance || 0;
    const monthlyRecurring = projections[0]?.recurringExpenses || 0;
    
    if (currentBalance > 0 && monthlyRecurring > 0) {
      const ratio = monthlyRecurring / currentBalance;
      if (ratio > 0.5) {
        alerts.push({
          type: 'default',
          title: 'High Recurring Expense Ratio',
          description: `Your monthly recurring expenses (${(ratio * 100).toFixed(1)}% of current balance) may be too high. Consider optimizing.`,
          icon: <DollarSign className="h-4 w-4" />,
        });
      }
    }

    return alerts;
  }, [projections, recurringExpenses]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Cash Flow Alerts</h3>
        <Badge variant="secondary">{notifications.length}</Badge>
      </div>
      
      {notifications.map((notification, index) => (
        <Alert key={index} variant={notification.type}>
          {notification.icon}
          <AlertTitle>{notification.title}</AlertTitle>
          <AlertDescription>{notification.description}</AlertDescription>
        </Alert>
      ))}

      {/* Upcoming expenses detail */}
      {recurringExpenses.some(exp => exp.next_due_date && new Date(exp.next_due_date) <= addDays(new Date(), 30)) && (
        <div className="mt-4 p-4 border rounded-lg bg-muted/10">
          <h4 className="font-medium mb-2">Upcoming Recurring Expenses (Next 30 Days)</h4>
          <div className="space-y-2">
            {recurringExpenses
              .filter(exp => exp.next_due_date && new Date(exp.next_due_date) <= addDays(new Date(), 30))
              .sort((a, b) => new Date(a.next_due_date!).getTime() - new Date(b.next_due_date!).getTime())
              .map(expense => (
                <div key={expense.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">{expense.description}</span>
                    <span className="text-muted-foreground ml-2">
                      ({expense.recurrence_pattern})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${Math.abs(expense.amount).toLocaleString()}</div>
                    <div className="text-muted-foreground text-xs">
                      Due: {format(new Date(expense.next_due_date!), 'MMM dd')}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}