import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Database } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DashboardSkeleton,
  ChartSkeleton,
} from "@/components/ui/skeleton-screens";
import { formatCurrency } from "@/utils/formatters/numberFormatters";
import { UnifiedTransactionsTable } from "@/components/common/UnifiedTransactionsTable";
import { useExpenses } from "@/contexts/ExpenseContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Expenses = () => {
  const [accountsExpanded, setAccountsExpanded] = useState(false);

  // Use real QuickBooks data from context
  const { expenseRecords, isLoading, refetch } = useExpenses();

  const totalExpenses = useMemo(
    () => expenseRecords.reduce((sum, record) => sum + record.amount, 0),
    [expenseRecords],
  );

  const avgExpenseValue = useMemo(() => {
    if (expenseRecords.length === 0) return 0;
    return totalExpenses / expenseRecords.length;
  }, [expenseRecords, totalExpenses]);

  const processedData = useMemo(() => {
    if (!expenseRecords.length) {
      return {
        chartAccountTotals: {},
        monthlyTrends: [],
        topChartAccounts: [],
        recentTransactions: [],
      };
    }

    // Calculate chart of accounts totals
    const chartAccountTotals = expenseRecords.reduce((acc, record) => {
      const accountKey =
        record.chart_account_name || record.category || "Uncategorized";
      const accountCode = record.chart_account_code || "";
      const displayName = accountCode
        ? `${accountCode} - ${accountKey}`
        : accountKey;

      acc[displayName] = (acc[displayName] || 0) + Number(record.amount);
      return acc;
    }, {});

    // Get top 5 chart accounts
    const topChartAccounts = Object.entries(chartAccountTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // Group by month for trends
    const monthlyData = expenseRecords.reduce((acc, record) => {
      const month = new Date(record.transaction_date).toLocaleString(
        "default",
        { month: "short", year: "2-digit" },
      );
      acc[month] = (acc[month] || 0) + record.amount;
      return acc;
    }, {});

    const monthlyTrends = Object.keys(monthlyData)
      .map((month) => ({
        month,
        total: monthlyData[month],
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    // Get recent transactions
    const recentTransactions = [...expenseRecords]
      .sort(
        (a, b) =>
          new Date(b.transaction_date).getTime() -
          new Date(a.transaction_date).getTime(),
      )
      .slice(0, 5);

    return {
      chartAccountTotals,
      monthlyTrends,
      topChartAccounts,
      recentTransactions,
    };
  }, [expenseRecords]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Expense Management</h1>
            <p className="text-muted-foreground mt-1">
              Track expenses by chart of accounts
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                console.log("Manual refetch triggered");
                refetch();
              }}
              size="sm"
            >
              <Database className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalExpenses)}
              </div>
              <p className="text-sm text-muted-foreground">
                All recorded expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Number of Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenseRecords.length}</div>
              <p className="text-sm text-muted-foreground">
                Total expense transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(processedData.chartAccountTotals).length}
              </div>
              <p className="text-sm text-muted-foreground">
                Unique expense accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Expense Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(avgExpenseValue)}
              </div>
              <p className="text-sm text-muted-foreground">
                Average per transaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {processedData.monthlyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Expenses"]}
                    />
                    <Bar dataKey="total" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartSkeleton height={300} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Distribution by Account</CardTitle>
            </CardHeader>
            <CardContent>
              {processedData.topChartAccounts.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={processedData.topChartAccounts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {processedData.topChartAccounts.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [formatCurrency(value), "Amount"]}
                        labelFormatter={(label) => label}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* External Legend */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {processedData.topChartAccounts.map((entry, index) => {
                      const total = processedData.topChartAccounts.reduce(
                        (sum, item) => sum + item.value,
                        0,
                      );
                      const percentage = ((entry.value / total) * 100).toFixed(
                        1,
                      );
                      return (
                        <div
                          key={entry.name}
                          className="flex items-center gap-3 p-2 rounded-md bg-muted/30"
                        >
                          <div
                            className="w-4 h-4 rounded-sm flex-shrink-0"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {entry.name.split(" - ")[0]}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(entry.value)} ({percentage}%)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <ChartSkeleton height={300} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Expense Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <Collapsible
                open={accountsExpanded}
                onOpenChange={setAccountsExpanded}
              >
                {/* Always show first 3 accounts */}
                <div className="space-y-4">
                  {processedData.topChartAccounts
                    .slice(0, 3)
                    .map((account, index) => (
                      <div
                        key={account.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="font-medium text-sm">
                            {account.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatCurrency(account.value)}
                        </span>
                      </div>
                    ))}
                </div>

                <CollapsibleContent>
                  <div className="space-y-4 mt-4">
                    {processedData.topChartAccounts
                      .slice(3)
                      .map((account, index) => (
                        <div
                          key={account.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  COLORS[(index + 3) % COLORS.length],
                              }}
                            />
                            <span className="font-medium text-sm">
                              {account.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold">
                            {formatCurrency(account.value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </CollapsibleContent>

                {processedData.topChartAccounts.length > 3 && (
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-4 h-8"
                    >
                      <span className="text-xs text-muted-foreground mr-2">
                        {accountsExpanded
                          ? `Showing all ${processedData.topChartAccounts.length} accounts`
                          : `Showing 3 of ${processedData.topChartAccounts.length} accounts`}
                      </span>
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${
                          accountsExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                )}
              </Collapsible>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedTransactionsTable
                transactions={processedData.recentTransactions}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Expenses;
