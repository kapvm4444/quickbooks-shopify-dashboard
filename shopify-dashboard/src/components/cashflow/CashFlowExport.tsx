import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { format } from 'date-fns';

interface CashFlowProjection {
  month: string;
  inflow: number;
  outflow: number;
  balance: number;
  recurringExpenses: number;
  oneTimeExpenses: number;
}

interface CashFlowExportProps {
  projections: CashFlowProjection[];
  summary: {
    totalRecurringMonthly: number;
    currentBalance: number;
    projectedBalance6Months: number;
    projectedBalance12Months: number;
    recurringExpenseCount: number;
  };
}

export function CashFlowExport({ projections, summary }: CashFlowExportProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['Month', 'Inflow', 'Outflow', 'Recurring Expenses', 'One-time Expenses', 'Net Flow', 'Running Balance'];
    const rows = projections.map(p => [
      p.month,
      p.inflow.toString(),
      p.outflow.toString(),
      p.recurringExpenses.toString(),
      p.oneTimeExpenses.toString(),
      (p.inflow - p.outflow).toString(),
      p.balance.toString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cash-flow-forecast-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Cash Flow Forecast Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .summary { margin-bottom: 20px; }
            .summary-item { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f2f2f2; }
            .positive { color: green; }
            .negative { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Cash Flow Forecast Report</h1>
            <p>Generated on ${format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>
          <div class="summary">
            <h2>Summary</h2>
            <div class="summary-item">Current Balance: ${formatCurrency(summary.currentBalance)}</div>
            <div class="summary-item">Monthly Recurring Expenses: ${formatCurrency(summary.totalRecurringMonthly)}</div>
            <div class="summary-item">6-Month Projection: ${formatCurrency(summary.projectedBalance6Months)}</div>
            <div class="summary-item">12-Month Projection: ${formatCurrency(summary.projectedBalance12Months)}</div>
            <div class="summary-item">Total Recurring Expenses: ${summary.recurringExpenseCount}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Inflow</th>
                <th>Outflow</th>
                <th>Recurring</th>
                <th>One-time</th>
                <th>Net Flow</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${projections.map(p => `
                <tr>
                  <td style="text-align: left;">${p.month}</td>
                  <td class="positive">${formatCurrency(p.inflow)}</td>
                  <td class="negative">${formatCurrency(p.outflow)}</td>
                  <td>${formatCurrency(p.recurringExpenses)}</td>
                  <td>${formatCurrency(p.oneTimeExpenses)}</td>
                  <td class="${p.inflow - p.outflow >= 0 ? 'positive' : 'negative'}">${formatCurrency(p.inflow - p.outflow)}</td>
                  <td class="${p.balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(p.balance)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportToJSON = () => {
    const data = {
      summary,
      projections,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cash-flow-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <Printer className="h-4 w-4 mr-2" />
          Print/PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="h-4 w-4 mr-2" />
          Export Data (JSON)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}