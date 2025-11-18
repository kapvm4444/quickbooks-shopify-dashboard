import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters/numberFormatters';
import { TransactionWithAging } from '@/utils/calculations/agingAnalysis';
import { Badge } from '@/components/ui/badge';

interface AgingAnalysisTableProps {
  transactions: TransactionWithAging[];
  title: string;
}

export const AgingAnalysisTable: React.FC<AgingAnalysisTableProps> = ({
  transactions,
  title,
}) => {
  const getBucketColor = (bucket: string) => {
    if (bucket.includes('0-30')) return 'default';
    if (bucket.includes('30-60')) return 'secondary';
    if (bucket.includes('60-90')) return 'outline';
    return 'destructive';
  };

  if (transactions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer/Vendor</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Days Overdue</TableHead>
              <TableHead>Aging Bucket</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {transaction.customerOrVendor}
                </TableCell>
                <TableCell>{transaction.invoiceNumber || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>{transaction.dueDate}</TableCell>
                <TableCell className="text-right">
                  {transaction.daysOverdue} days
                </TableCell>
                <TableCell>
                  <Badge variant={getBucketColor(transaction.bucket)}>
                    {transaction.bucket}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
