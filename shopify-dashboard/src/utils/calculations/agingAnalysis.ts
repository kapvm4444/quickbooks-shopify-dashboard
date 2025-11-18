import { differenceInDays } from 'date-fns';

export interface AgingBucket {
  label: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
  days: string;
}

export interface TransactionWithAging {
  id: string;
  customerOrVendor: string;
  invoiceNumber?: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  bucket: string;
}

export function calculateAgingBuckets(
  transactions: Array<{
    id: string;
    amount: number;
    due_date?: string;
    transaction_date: string;
    status: string;
    customer_name?: string;
    vendor_name?: string;
    invoice_number?: string;
  }>
): {
  buckets: AgingBucket[];
  transactions: TransactionWithAging[];
  totalOutstanding: number;
} {
  const today = new Date();
  
  // Filter only outstanding and overdue transactions
  const activeTransactions = transactions.filter(
    t => t.status === 'outstanding' || t.status === 'overdue'
  );

  // Initialize buckets
  const buckets = {
    current: { label: 'Current (0-30)', amount: 0, count: 0, color: 'text-green-600', days: '0-30' },
    thirty: { label: '30-60 Days', amount: 0, count: 0, color: 'text-yellow-600', days: '30-60' },
    sixty: { label: '60-90 Days', amount: 0, count: 0, color: 'text-orange-600', days: '60-90' },
    ninety: { label: '90+ Days', amount: 0, count: 0, color: 'text-red-600', days: '90+' }
  };

  const transactionsWithAging: TransactionWithAging[] = [];
  let totalOutstanding = 0;

  activeTransactions.forEach(transaction => {
    // Use due_date if available, otherwise use transaction_date + 30 days
    const dueDate = transaction.due_date 
      ? new Date(transaction.due_date)
      : new Date(new Date(transaction.transaction_date).getTime() + 30 * 24 * 60 * 60 * 1000);

    const daysOverdue = differenceInDays(today, dueDate);
    const amount = Number(transaction.amount);
    totalOutstanding += amount;

    let bucket: string;
    let bucketKey: 'current' | 'thirty' | 'sixty' | 'ninety';

    if (daysOverdue <= 30) {
      bucket = 'Current (0-30)';
      bucketKey = 'current';
    } else if (daysOverdue <= 60) {
      bucket = '30-60 Days';
      bucketKey = 'thirty';
    } else if (daysOverdue <= 90) {
      bucket = '60-90 Days';
      bucketKey = 'sixty';
    } else {
      bucket = '90+ Days';
      bucketKey = 'ninety';
    }

    buckets[bucketKey].amount += amount;
    buckets[bucketKey].count += 1;

    transactionsWithAging.push({
      id: transaction.id,
      customerOrVendor: transaction.customer_name || transaction.vendor_name || 'Unknown',
      invoiceNumber: transaction.invoice_number,
      amount,
      dueDate: dueDate.toISOString().split('T')[0],
      daysOverdue: Math.max(0, daysOverdue),
      bucket
    });
  });

  // Calculate percentages
  const bucketArray: AgingBucket[] = Object.values(buckets).map(bucket => ({
    ...bucket,
    percentage: totalOutstanding > 0 ? (bucket.amount / totalOutstanding) * 100 : 0
  }));

  // Sort transactions by days overdue (oldest first)
  transactionsWithAging.sort((a, b) => b.daysOverdue - a.daysOverdue);

  return {
    buckets: bucketArray,
    transactions: transactionsWithAging,
    totalOutstanding
  };
}
