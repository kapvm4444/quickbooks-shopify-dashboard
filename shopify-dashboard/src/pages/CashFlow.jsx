import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Plus,
  Upload,
  TrendingDown,
  DollarSign,
  Repeat,
} from "lucide-react";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { CashFlowExport } from "@/components/cashflow/CashFlowExport";
import { CashFlowNotifications } from "@/components/cashflow/CashFlowNotifications";
import { CashFlowScenarios } from "@/components/cashflow/CashFlowScenarios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";

const staticCashFlowProjections = [
  {
    month: "Nov 2025",
    inflow: 25000,
    outflow: 15000,
    recurringExpenses: 10000,
    oneTimeExpenses: 5000,
    balance: 60000,
  },
  {
    month: "Dec 2025",
    inflow: 30000,
    outflow: 18000,
    recurringExpenses: 10000,
    oneTimeExpenses: 8000,
    balance: 72000,
  },
  {
    month: "Jan 2026",
    inflow: 28000,
    outflow: 16000,
    recurringExpenses: 10000,
    oneTimeExpenses: 6000,
    balance: 84000,
  },
  {
    month: "Feb 2026",
    inflow: 32000,
    outflow: 20000,
    recurringExpenses: 10000,
    oneTimeExpenses: 10000,
    balance: 96000,
  },
  {
    month: "Mar 2026",
    inflow: 35000,
    outflow: 22000,
    recurringExpenses: 10000,
    oneTimeExpenses: 12000,
    balance: 109000,
  },
  {
    month: "Apr 2026",
    inflow: 33000,
    outflow: 21000,
    recurringExpenses: 10000,
    oneTimeExpenses: 11000,
    balance: 121000,
  },
];

const staticSummary = {
  currentBalance: 50000,
  totalRecurringMonthly: 10000,
  recurringExpenseCount: 5,
  projectedBalance6Months: 121000,
  projectedBalance12Months: 180000,
};

const staticRecurringExpenses = [
  {
    id: "re1",
    description: "Office Rent",
    amount: 5000,
    next_due_date: "2025-12-01",
    recurrence_pattern: "monthly",
  },
  {
    id: "re2",
    description: "Software Subscriptions",
    amount: 1500,
    next_due_date: "2025-11-15",
    recurrence_pattern: "monthly",
  },
  {
    id: "re3",
    description: "Marketing Retainer",
    amount: 3500,
    next_due_date: "2025-11-20",
    recurrence_pattern: "monthly",
  },
];

export default function CashFlow() {
  const navigate = useNavigate();
  const [forecastMonths, setForecastMonths] = useState(12);
  const cashFlowProjections = staticCashFlowProjections;
  const summary = staticSummary;
  const isLoading = false;
  const recurringExpenses = staticRecurringExpenses;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Cash Flow Forecast
            </h1>
            <p className="text-muted-foreground">
              Monitor and project your business cash flow with recurring expense
              tracking
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={forecastMonths.toString()}
              onValueChange={(value) => setForecastMonths(parseInt(value))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6-Month Forecast</SelectItem>
                <SelectItem value="12">12-Month Forecast</SelectItem>
                <SelectItem value="18">18-Month Forecast</SelectItem>
                <SelectItem value="24">24-Month Forecast</SelectItem>
              </SelectContent>
            </Select>
            <CashFlowExport
              projections={cashFlowProjections}
              summary={summary}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.currentBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Current cash position
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Recurring
              </CardTitle>
              <Repeat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.totalRecurringMonthly)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.recurringExpenseCount} recurring expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                6-Month Projection
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.projectedBalance6Months)}
              </div>
              <p className="text-xs text-muted-foreground">
                Projected cash position
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                12-Month Projection
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.projectedBalance12Months)}
              </div>
              <p className="text-xs text-muted-foreground">
                Long-term projection
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        {cashFlowProjections.length > 0 && (
          <CashFlowNotifications
            projections={cashFlowProjections}
            recurringExpenses={recurringExpenses}
          />
        )}

        {/* Cash Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Projection</CardTitle>
            <CardDescription>
              Monthly cash inflow vs outflow with running balance projection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">
                  Loading cash flow data...
                </div>
              </div>
            ) : cashFlowProjections.length > 0 ? (
              <CashFlowChart data={cashFlowProjections} />
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">No Cash Flow Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Add financial records and recurring expenses to generate
                    projections
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" onClick={() => navigate("/expenses")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expenses
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/revenue")}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Revenue
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scenario Planning */}
        {cashFlowProjections.length > 0 && (
          <CashFlowScenarios baseProjections={cashFlowProjections} />
        )}

        {/* Projection Table */}
        {cashFlowProjections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
              <CardDescription>
                Detailed view of projected cash flow by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Month</th>
                      <th className="text-right p-2">Inflow</th>
                      <th className="text-right p-2">Outflow</th>
                      <th className="text-right p-2">Recurring</th>
                      <th className="text-right p-2">One-time</th>
                      <th className="text-right p-2">Net</th>
                      <th className="text-right p-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlowProjections.map((projection, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{projection.month}</td>
                        <td className="p-2 text-right text-green-600">
                          {formatCurrency(projection.inflow)}
                        </td>
                        <td className="p-2 text-right text-red-600">
                          {formatCurrency(projection.outflow)}
                        </td>
                        <td className="p-2 text-right text-orange-600">
                          {formatCurrency(projection.recurringExpenses)}
                        </td>
                        <td className="p-2 text-right text-gray-600">
                          {formatCurrency(projection.oneTimeExpenses)}
                        </td>
                        <td
                          className={`p-2 text-right font-medium ${
                            projection.inflow - projection.outflow >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(
                            projection.inflow - projection.outflow,
                          )}
                        </td>
                        <td
                          className={`p-2 text-right font-bold ${
                            projection.balance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(projection.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
