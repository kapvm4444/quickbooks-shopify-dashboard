import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters/numberFormatters';
import { AgingBucket } from '@/utils/calculations/agingAnalysis';

interface AgingAnalysisCardsProps {
  buckets: AgingBucket[];
  title: string;
}

export const AgingAnalysisCards: React.FC<AgingAnalysisCardsProps> = ({
  buckets,
  title,
}) => {
  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 1:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      case 2:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
      case 3:
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {buckets.map((bucket, index) => (
          <Card key={bucket.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {bucket.label}
              </CardTitle>
              {getIcon(index)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${bucket.color}`}>
                {formatCurrency(bucket.amount)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {bucket.count} {bucket.count === 1 ? 'transaction' : 'transactions'}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {bucket.percentage.toFixed(1)}%
                </p>
              </div>
              {bucket.percentage > 0 && (
                <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      index === 0
                        ? 'bg-green-500'
                        : index === 1
                        ? 'bg-yellow-500'
                        : index === 2
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${bucket.percentage}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
