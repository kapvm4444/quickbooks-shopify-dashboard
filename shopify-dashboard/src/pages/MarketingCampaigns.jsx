import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialCard } from "@/components/FinancialCard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Target,
  DollarSign,
  Eye,
  MousePointer,
  Plus,
} from "lucide-react";
import { CreateCampaignDialog } from "@/components/marketing/CreateCampaignDialog";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const campaignsData = {
  summary: {
    totalSpend: 23500,
    totalImpressions: 1500000,
    ctr: 2.5,
    conversionRate: 4.2,
  },
  activeCampaigns: [
    {
      name: "Q4 Holiday Sale",
      platform: "Facebook",
      status: "Active",
      budget: 10000,
      spend: 7500,
      conversions: 120,
      roi: 350,
    },
    {
      name: "Black Friday Special",
      platform: "Google Ads",
      status: "Active",
      budget: 15000,
      spend: 12000,
      conversions: 250,
      roi: 500,
    },
    {
      name: "New Year Promo",
      platform: "Instagram",
      status: "Paused",
      budget: 5000,
      spend: 2000,
      conversions: 45,
      roi: 200,
    },
    {
      name: "Summer Collection Launch",
      platform: "TikTok",
      status: "Completed",
      budget: 8000,
      spend: 8000,
      conversions: 150,
      roi: 400,
    },
  ],
  performanceOverTime: [
    { date: "2025-10-01", spend: 2000, conversions: 30 },
    { date: "2025-10-08", spend: 2500, conversions: 45 },
    { date: "2025-10-15", spend: 3000, conversions: 60 },
    { date: "2025-10-22", spend: 4000, conversions: 85 },
    { date: "2025-10-29", spend: 5500, conversions: 110 },
    { date: "2025-11-05", spend: 6500, conversions: 130 },
  ],
};

export default function MarketingCampaigns() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { summary, activeCampaigns, performanceOverTime } = campaignsData;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Marketing Campaigns
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage your marketing campaign performance
            </p>
          </div>
          <Button
            className="bg-financial-primary text-white hover:bg-financial-primary/90"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Campaign Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FinancialCard
            title="Total Ad Spend"
            value={formatCurrency(summary.totalSpend)}
            change={-10} // Example change
            icon={<DollarSign className="h-4 w-4" />}
            variant="expense"
          />
          <FinancialCard
            title="Total Impressions"
            value={summary.totalImpressions.toLocaleString()}
            change={15} // Example change
            icon={<Eye className="h-4 w-4" />}
            variant="neutral"
          />
          <FinancialCard
            title="Click-Through Rate (CTR)"
            value={`${summary.ctr}%`}
            change={5} // Example change
            icon={<MousePointer className="h-4 w-4" />}
            variant="revenue"
          />
          <FinancialCard
            title="Conversion Rate"
            value={`${summary.conversionRate}%`}
            change={8} // Example change
            icon={<Target className="h-4 w-4" />}
            variant="revenue"
          />
        </div>

        {/* Campaign Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Campaign Performance Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={performanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  yAxisId="left"
                  label={{
                    value: "Spend ($)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Conversions",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === "Spend" ? formatCurrency(value) : value
                  }
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="spend"
                  stroke="#dc2626"
                  name="Spend"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="conversions"
                  stroke="#16a34a"
                  name="Conversions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Campaigns Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCampaigns.map((campaign) => (
                <div key={campaign.name} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {campaign.platform}
                      </p>
                    </div>
                    <Badge
                      variant={
                        campaign.status === "Active" ? "default" : "secondary"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-semibold">
                        {formatCurrency(campaign.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Spend</p>
                      <p className="font-semibold">
                        {formatCurrency(campaign.spend)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Conversions
                      </p>
                      <p className="font-semibold">{campaign.conversions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="font-semibold text-green-600">
                        {campaign.roi}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <CreateCampaignDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </>
  );
}
