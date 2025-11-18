import { DashboardLayout } from "@/components/DashboardLayout";
import { FinancialCard } from "@/components/FinancialCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Activity,
  Zap,
  TrendingDown,
} from "lucide-react";

const kpiData = {
  financials: {
    revenue: { value: 1250000, change: 15.2, target: 1500000 },
    netProfit: { value: 300000, change: 8.5, target: 250000 },
    burnRate: { value: 80000, change: -5.0, target: 75000 },
    customerAcquisitionCost: { value: 150, change: 10.0, target: 120 },
  },
  customers: {
    totalCustomers: { value: 5250, change: 25.0 },
    newCustomers: { value: 750, change: 30.0 },
    churnRate: { value: 2.5, change: -15.0 },
  },
  engagement: {
    monthlyActiveUsers: { value: 15000, change: 18.0 },
    dailyActiveUsers: { value: 4500, change: 22.0 },
    userRetention: { value: 65, change: 5.0 },
  },
};

const KPIDashboard = () => {
  const { financials, customers, engagement } = kpiData;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">
              Key Performance Indicators
            </h1>
            <p className="text-black mt-1">
              Track and monitor critical business metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-gradient-primary text-white border-0"
            >
              <Calendar className="w-3 h-3 mr-1" />
              Q4 2025
            </Badge>
          </div>
        </div>

        {/* Financial KPIs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-financial-revenue" />{" "}
              Financial KPIs
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinancialCard
              title="Total Revenue"
              value={formatCurrency(financials.revenue.value)}
              change={financials.revenue.change}
              icon={<TrendingUp />}
              variant="revenue"
            />
            <FinancialCard
              title="Net Profit"
              value={formatCurrency(financials.netProfit.value)}
              change={financials.netProfit.change}
              icon={<DollarSign />}
              variant="revenue"
            />
            <FinancialCard
              title="Monthly Burn Rate"
              value={formatCurrency(financials.burnRate.value)}
              change={financials.burnRate.change}
              icon={<TrendingDown />}
              variant="expense"
            />
            <FinancialCard
              title="Customer Acquisition Cost (CAC)"
              value={formatCurrency(financials.customerAcquisitionCost.value)}
              change={financials.customerAcquisitionCost.change}
              icon={<Users />}
              variant="expense"
            />
          </CardContent>
        </Card>

        {/* Customer KPIs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-financial-primary" /> Customer KPIs
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FinancialCard
              title="Total Customers"
              value={customers.totalCustomers.value.toLocaleString()}
              change={customers.totalCustomers.change}
              icon={<Users />}
            />
            <FinancialCard
              title="New Customers (This Month)"
              value={customers.newCustomers.value.toLocaleString()}
              change={customers.newCustomers.change}
              icon={<Users />}
            />
            <FinancialCard
              title="Churn Rate"
              value={`${customers.churnRate.value}%`}
              change={customers.churnRate.change}
              icon={<TrendingDown />}
              variant="expense"
            />
          </CardContent>
        </Card>

        {/* Engagement KPIs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-financial-accent" /> User
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FinancialCard
              title="Monthly Active Users (MAU)"
              value={engagement.monthlyActiveUsers.value.toLocaleString()}
              change={engagement.monthlyActiveUsers.change}
              icon={<Activity />}
            />
            <FinancialCard
              title="Daily Active Users (DAU)"
              value={engagement.dailyActiveUsers.value.toLocaleString()}
              change={engagement.dailyActiveUsers.change}
              icon={<Zap />}
            />
            <FinancialCard
              title="User Retention (Monthly)"
              value={`${engagement.userRetention.value}%`}
              change={engagement.userRetention.change}
              icon={<TrendingUp />}
            />
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-black">
                  Q4 Revenue Target
                </span>
                <span className="text-sm font-medium text-black">
                  {formatCurrency(financials.revenue.value)} /{" "}
                  {formatCurrency(financials.revenue.target)}
                </span>
              </div>
              <Progress
                value={
                  (financials.revenue.value / financials.revenue.target) * 100
                }
                className="w-full"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-black">
                  Q4 Profitability Target
                </span>
                <span className="text-sm font-medium text-black">
                  {formatCurrency(financials.netProfit.value)} /{" "}
                  {formatCurrency(financials.netProfit.target)}
                </span>
              </div>
              <Progress
                value={
                  (financials.netProfit.value / financials.netProfit.target) *
                  100
                }
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default KPIDashboard;
