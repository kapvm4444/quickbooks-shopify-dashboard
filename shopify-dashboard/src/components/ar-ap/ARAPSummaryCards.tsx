import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { ARTransaction, APTransaction } from '@/hooks/useARAPData';
import { formatCurrency } from '@/utils/formatters/numberFormatters';

interface ARAPSummaryCardsProps {
  arTransactions: ARTransaction[];
  apTransactions: APTransaction[];
}

export const ARAPSummaryCards: React.FC<ARAPSummaryCardsProps> = ({
  arTransactions,
  apTransactions,
}) => {
  const arOutstanding = arTransactions
    .filter(t => t.status === 'outstanding')
    .reduce((sum, t) => sum + t.amount, 0);

  const arOverdue = arTransactions
    .filter(t => t.status === 'overdue')
    .reduce((sum, t) => sum + t.amount, 0);

  const apOutstanding = apTransactions
    .filter(t => t.status === 'outstanding')
    .reduce((sum, t) => sum + t.amount, 0);

  const apOverdue = apTransactions
    .filter(t => t.status === 'overdue')
    .reduce((sum, t) => sum + t.amount, 0);

  const netPosition = arOutstanding - apOutstanding;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AR Outstanding</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(arOutstanding)}
          </div>
          <p className="text-xs text-muted-foreground">
            {arTransactions.filter(t => t.status === 'outstanding').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AR Overdue</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(arOverdue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {arTransactions.filter(t => t.status === 'overdue').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AP Outstanding</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(apOutstanding)}
          </div>
          <p className="text-xs text-muted-foreground">
            {apTransactions.filter(t => t.status === 'outstanding').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AP Overdue</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(apOverdue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {apTransactions.filter(t => t.status === 'overdue').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Position</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netPosition)}
          </div>
          <p className="text-xs text-muted-foreground">
            {netPosition >= 0 ? 'Positive' : 'Negative'} cash flow
          </p>
        </CardContent>
      </Card>
    </div>
  );
};