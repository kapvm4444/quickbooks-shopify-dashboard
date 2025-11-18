import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialCard } from "@/components/FinancialCard";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  Target,
  Globe,
  DollarSign,
  BarChart as BarChartIcon,
  Mail,
  MessageSquare,
} from "lucide-react";
import { MarketingToolsDialog } from "@/components/marketing/MarketingToolsDialog";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
} from "recharts";

const marketingData = {
  summary: {
    totalTraffic: { value: 78500, change: 12.5 },
    conversionRate: { value: 3.5, change: 8.0 },
    cpa: { value: 25.5, change: -5.0 },
    clv: { value: 450, change: 15.0 },
  },
  trafficBySource: [
    { name: "Organic Search", value: 40, color: "#2563eb" },
    { name: "Paid Search", value: 25, color: "#16a34a" },
    { name: "Social Media", value: 20, color: "#f59e0b" },
    { name: "Referral", value: 10, color: "#dc2626" },
    { name: "Direct", value: 5, color: "#8b5cf6" },
  ],
  conversionFunnel: [
    { stage: "Visitors", value: 78500 },
    { stage: "Leads", value: 9800 },
    { stage: "MQLs", value: 4200 },
    { stage: "SQLs", value: 1500 },
    { stage: "Customers", value: 2750 },
  ],
  topCampaigns: [
    {
      name: "Q4 Holiday Sale",
      channel: "Email",
      roi: 350,
      spend: 5000,
      revenue: 22500,
    },
    {
      name: "Black Friday Special",
      channel: "Social Media",
      roi: 500,
      spend: 10000,
      revenue: 60000,
    },
    {
      name: "New Year, New Gear",
      channel: "Paid Search",
      roi: 250,
      spend: 8000,
      revenue: 28000,
    },
  ],
};

export default function MarketingAnalytics() {
  const [toolsDialogOpen, setToolsDialogOpen] = useState(false);
  const { summary, trafficBySource, conversionFunnel, topCampaigns } =
    marketingData;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Marketing Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Deep dive into your marketing performance and customer insights
          </p>
        </div>
        <Button onClick={() => setToolsDialogOpen(true)}>
          Connect Marketing Tools
        </Button>
      </div>

      {/* Marketing KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinancialCard
          title="Total Website Traffic"
          value={summary.totalTraffic.value.toLocaleString()}
          change={summary.totalTraffic.change}
          icon={<Globe className="h-4 w-4" />}
          variant="neutral"
        />
        <FinancialCard
          title="Conversion Rate"
          value={`${summary.conversionRate.value}%`}
          change={summary.conversionRate.change}
          icon={<Target className="h-4 w-4" />}
          variant="revenue"
        />
        <FinancialCard
          title="Cost Per Acquisition (CPA)"
          value={formatCurrency(summary.cpa.value)}
          change={summary.cpa.change}
          icon={<DollarSign className="h-4 w-4" />}
          variant="expense"
        />
        <FinancialCard
          title="Customer Lifetime Value (CLV)"
          value={formatCurrency(summary.clv.value)}
          change={summary.clv.change}
          icon={<Users className="h-4 w-4" />}
          variant="revenue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic by Source */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-primary" /> Traffic by
              Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficBySource}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                >
                  {trafficBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" /> Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={conversionFunnel}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={80} />
                <Tooltip formatter={(value) => value.toLocaleString()} />
                <Bar dataKey="value" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-500" /> Top Performing
            Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCampaigns.map((campaign) => (
              <div
                key={campaign.name}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold">{campaign.name}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    {campaign.channel === "Email" && (
                      <Mail className="w-4 h-4" />
                    )}
                    {campaign.channel === "Social Media" && (
                      <MessageSquare className="w-4 h-4" />
                    )}
                    {campaign.channel === "Paid Search" && (
                      <DollarSign className="w-4 h-4" />
                    )}
                    {campaign.channel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">
                    {campaign.roi}% ROI
                  </p>
                  <p className="text-sm">
                    Spend: {formatCurrency(campaign.spend)} | Revenue:{" "}
                    {formatCurrency(campaign.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <MarketingToolsDialog
        open={toolsDialogOpen}
        onOpenChange={setToolsDialogOpen}
      />
    </div>
  );
}
