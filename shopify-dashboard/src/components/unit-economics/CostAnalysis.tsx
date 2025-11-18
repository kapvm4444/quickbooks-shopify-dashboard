import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  BarChart as BarChartIcon,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// Using dedicated chart colors for optimal contrast and visibility
const CHART_COLORS = [
  "hsl(var(--chart-1))", // Blue
  "hsl(var(--chart-2))", // Green
  "hsl(var(--chart-3))", // Red
  "hsl(var(--chart-4))", // Orange
  "hsl(var(--chart-5))", // Purple
  "hsl(var(--chart-6))", // Cyan
  "hsl(var(--chart-7))", // Pink
  "hsl(var(--chart-8))", // Light Blue
  "hsl(var(--chart-9))", // Lime
  "hsl(var(--chart-10))", // Amber
];

const staticAnalytics = {
  skuEconomics: [
    {
      sku_id: "SKU001",
      sku: "SKU001",
      name: "Wireless Mouse",
      gross_margin_percent: 45.5,
      current_po_number: "PO123",
    },
    {
      sku_id: "SKU002",
      sku: "SKU002",
      name: "Mechanical Keyboard",
      gross_margin_percent: 60.2,
      current_po_number: "PO123",
    },
    {
      sku_id: "SKU003",
      sku: "SKU003",
      name: "A4 Paper Ream",
      gross_margin_percent: 15.0,
      current_po_number: "PO124",
    },
    {
      sku_id: "SKU004",
      sku: "SKU004",
      name: "Desk Chair",
      gross_margin_percent: -5.0,
      current_po_number: "PO125",
    },
    {
      sku_id: "SKU005",
      sku: "SKU005",
      name: "USB-C Hub",
      gross_margin_percent: 35.8,
      current_po_number: "PO126",
    },
  ],
  avgGrossMargin: 30.3,
  totalSKUs: 5,
  profitableSKUs: 4,
  unprofitableSKUs: 1,
  highestMarginSKU: {
    name: "Mechanical Keyboard",
    gross_margin_percent: 60.2,
  },
  costComponentAnalysis: [
    { component: "Manufacturing", avgCost: 50, percentageOfTotal: 60 },
    { component: "Shipping", avgCost: 15, percentageOfTotal: 18 },
    { component: "Marketing", avgCost: 10, percentageOfTotal: 12 },
    { component: "Duties", avgCost: 8, percentageOfTotal: 10 },
  ],
  categoryBreakdown: [
    { category: "Electronics", skuCount: 3, avgMargin: 47.17 },
    { category: "Office Supplies", skuCount: 1, avgMargin: 15.0 },
    { category: "Furniture", skuCount: 1, avgMargin: -5.0 },
  ],
};

export const CostAnalysis = () => {
  const analytics = staticAnalytics;
  const isLoading = false;

  if (isLoading) {
    return <div>Loading cost analysis...</div>;
  }

  // Show empty state if no SKUs exist
  if (!analytics.skuEconomics || analytics.skuEconomics.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>
              Analyze your SKU performance and cost breakdowns to optimize
              profitability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <BarChartIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">
                  No cost data available
                </p>
                <p className="text-sm">
                  Add SKUs and configure their cost details in the SKU Cost
                  Management tab to see analytics here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const marginDistributionData = [
    {
      range: "< 10%",
      count: analytics.skuEconomics.filter((s) => s.gross_margin_percent < 10)
        .length,
    },
    {
      range: "10-20%",
      count: analytics.skuEconomics.filter(
        (s) => s.gross_margin_percent >= 10 && s.gross_margin_percent < 20,
      ).length,
    },
    {
      range: "20-30%",
      count: analytics.skuEconomics.filter(
        (s) => s.gross_margin_percent >= 20 && s.gross_margin_percent < 30,
      ).length,
    },
    {
      range: "30-40%",
      count: analytics.skuEconomics.filter(
        (s) => s.gross_margin_percent >= 30 && s.gross_margin_percent < 40,
      ).length,
    },
    {
      range: "> 40%",
      count: analytics.skuEconomics.filter((s) => s.gross_margin_percent >= 40)
        .length,
    },
  ];

  const topPerformingSKUs = analytics.skuEconomics
    .sort((a, b) => b.gross_margin_percent - a.gross_margin_percent)
    .slice(0, 5);

  const bottomPerformingSKUs = analytics.skuEconomics
    .sort((a, b) => a.gross_margin_percent - b.gross_margin_percent)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Gross Margin
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avgGrossMargin.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across {analytics.totalSKUs} SKUs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profitable SKUs
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.profitableSKUs}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.profitableSKUs / analytics.totalSKUs) * 100).toFixed(
                1,
              )}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unprofitable SKUs
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.unprofitableSKUs}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (analytics.unprofitableSKUs / analytics.totalSKUs) *
                100
              ).toFixed(1)}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Highest Margin SKU
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.highestMarginSKU?.gross_margin_percent.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.highestMarginSKU?.name}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Margin Distribution</CardTitle>
            <CardDescription>Number of SKUs by margin ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marginDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Component Breakdown</CardTitle>
            <CardDescription>
              Average cost distribution across all SKUs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.costComponentAnalysis.filter(
                      (c) => c.avgCost > 0,
                    )}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="avgCost"
                  >
                    {analytics.costComponentAnalysis
                      .filter((c) => c.avgCost > 0)
                      .map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `$${value.toFixed(2)}`,
                      name,
                    ]}
                    labelFormatter={(label) => `Component: ${label}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend with percentages */}
              <div className="flex flex-col justify-center space-y-3">
                {analytics.costComponentAnalysis
                  .filter((c) => c.avgCost > 0)
                  .map((entry, index) => (
                    <div
                      key={entry.component}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-sm border-2 border-background"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        <span className="font-medium text-sm">
                          {entry.component}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">
                          {entry.percentageOfTotal.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${entry.avgCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing SKUs</CardTitle>
            <CardDescription>Highest margin SKUs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingSKUs.map((sku, index) => (
                <div
                  key={sku.sku_id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{sku.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sku.sku} • PO: {sku.current_po_number || "N/A"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">
                    {sku.gross_margin_percent.toFixed(2)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bottom Performing SKUs</CardTitle>
            <CardDescription>
              Lowest margin SKUs requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bottomPerformingSKUs.map((sku, index) => (
                <div
                  key={sku.sku_id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{sku.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sku.sku} • PO: {sku.current_po_number || "N/A"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      sku.gross_margin_percent < 0 ? "destructive" : "secondary"
                    }
                  >
                    {sku.gross_margin_percent.toFixed(2)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>Average margins by product category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categoryBreakdown.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {category.skuCount} SKUs
                    </span>
                    <Badge
                      variant={
                        category.avgMargin >= 20 ? "default" : "secondary"
                      }
                    >
                      {category.avgMargin.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={Math.min(category.avgMargin, 100)}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
