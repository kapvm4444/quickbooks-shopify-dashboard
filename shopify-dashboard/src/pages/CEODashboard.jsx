import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  TrendingUp,
  DollarSign,
  Calendar,
  Briefcase,
  Award,
  Zap,
} from "lucide-react";

import { ExecutiveMetrics } from "@/components/business/ExecutiveMetrics";
import { RevenueChart, GrowthChart } from "@/components/charts/MemoizedCharts";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const staticFinancials = {
  totalRevenue: 1250000,
  totalExpenses: 950000,
  netProfit: 300000,
  annualRevenueRunRate: 1500000,
  grossMargin: 0.65,
  monthlyBurnRate: 80000,
};

const staticBusinessData = {
  totalFollowers: 75000,
};

const staticRevenueByChannel = [
  { name: "Organic Search", value: 45, color: "#3b82f6" },
  { name: "Direct", value: 30, color: "#10b981" },
  { name: "Referral", value: 15, color: "#f97316" },
  { name: "Social Media", value: 10, color: "#8b5cf6" },
];

const staticGrowthData = [
  { month: "Jan", growth: 2.5 },
  { month: "Feb", growth: 3.1 },
  { month: "Mar", growth: 4.5 },
  { month: "Apr", growth: 4.2 },
  { month: "May", growth: 5.8 },
  { month: "Jun", growth: 6.2 },
];

// Charts are now imported from dedicated memoized components
const CEODashboard = () => {
  const {
    totalRevenue,
    netProfit,
    annualRevenueRunRate,
    grossMargin,
    monthlyBurnRate,
  } = staticFinancials;

  const { totalFollowers } = staticBusinessData;
  const revenueByChannel = staticRevenueByChannel;
  const growthData = staticGrowthData;
  const isLoading = false;

  return (
    <ErrorBoundary>
      <>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary bg-clip-text text-slate-950">
                Executive Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Strategic overview of business performance and key metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-gradient-revenue text-white border-0"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Q2 2025
              </Badge>
            </div>
          </div>

          {/* Executive Metrics */}
          <ExecutiveMetrics
            annualRevenueRunRate={annualRevenueRunRate}
            grossMargin={grossMargin}
            totalFollowers={totalFollowers}
            monthlyBurnRate={monthlyBurnRate}
            isLoading={isLoading}
          />

          {/* Strategic Goals & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card-custom">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-financial-primary" />
                  Strategic Goals Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center text-muted-foreground py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No strategic goals set</p>
                  <p className="text-xs mt-1">
                    Add goals in the Goals section to track progress
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card-custom">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-financial-revenue" />
                  Monthly Growth Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GrowthChart data={growthData} />
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown & Key Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="shadow-card-custom">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-financial-accent" />
                  Revenue by Channel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart data={revenueByChannel} />
                <div className="space-y-2 mt-4">
                  {revenueByChannel.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card-custom">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-warning" />
                  Key Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No achievements recorded</p>
                  <p className="text-xs mt-1">
                    Key milestones will appear here as you achieve them
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card-custom">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-financial-primary" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {totalRevenue > 0 ? (
                  <div className="p-3 rounded-lg bg-financial-revenue/10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-financial-revenue" />
                      <span className="text-sm font-medium">
                        Revenue Tracking
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total revenue: ${totalRevenue.toLocaleString()}
                    </p>
                  </div>
                ) : null}

                {netProfit !== 0 ? (
                  <div
                    className={`p-3 rounded-lg ${
                      netProfit > 0
                        ? "bg-financial-revenue/10"
                        : "bg-financial-expense/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign
                        className={`h-4 w-4 ${
                          netProfit > 0
                            ? "text-financial-revenue"
                            : "text-financial-expense"
                        }`}
                      />
                      <span className="text-sm font-medium">Profitability</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Net {netProfit > 0 ? "profit" : "loss"}: $
                      {Math.abs(netProfit).toLocaleString()}
                    </p>
                  </div>
                ) : null}

                {totalRevenue === 0 && netProfit === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No financial data available</p>
                    <p className="text-xs mt-1">
                      Connect your financial data sources to see insights
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    </ErrorBoundary>
  );
};
export default CEODashboard;
