import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  TrendingUp,
  DollarSign,
  Target,
  Lightbulb,
  BarChart3,
  Download,
  Zap,
} from "lucide-react";
import { FinancialCard } from "@/components/FinancialCard";
import { PricingScenarios } from "@/components/pricing/PricingScenarios.jsx";
import { AIRecommendations } from "@/components/pricing/AIRecommendations.jsx";
import { PricingInsights } from "@/components/pricing/PricingInsights.jsx";
import { PricingComparison } from "@/components/pricing/PricingComparison.jsx";
import { PricingCharts } from "@/components/pricing/PricingCharts.jsx";

const staticPricingData = {
  scenarios: [
    {
      id: "s1",
      name: "Aggressive Growth",
      description: "15% price increase across all products.",
      impact: { revenue: "+25%", profit: "+15%" },
    },
    {
      id: "s2",
      name: "Market Penetration",
      description: "10% price decrease for new product lines.",
      impact: { revenue: "+5%", profit: "-5%" },
    },
    {
      id: "s3",
      name: "Competitor Match",
      description: "Match prices with top 3 competitors.",
      impact: { revenue: "+10%", profit: "+2%" },
    },
  ],
  recommendations: [
    {
      id: "r1",
      skus: { id: "SKU002", name: "Mechanical Keyboard", price: 120 },
      recommended_price: 135,
      reason: "High demand and low price elasticity.",
    },
    {
      id: "r2",
      skus: { id: "SKU001", name: "Wireless Mouse", price: 25 },
      recommended_price: 29.99,
      reason: "Market average is higher.",
    },
    {
      id: "r3",
      skus: { id: "SKU005", name: "USB-C Hub", price: 45 },
      recommended_price: 49.99,
      reason: "Opportunity to increase margin on high-volume item.",
    },
  ],
  insights: [
    {
      id: "i1",
      title: 'High elasticity for "Office Supplies"',
      priority: "high",
    },
    {
      id: "i2",
      title: 'Underpriced in "Electronics" category',
      priority: "medium",
    },
    {
      id: "i3",
      title: "Weekend pricing strategy shows 10% lift",
      priority: "low",
    },
  ],
  totalSkus: 5,
  avgMargin: 45.5,
  highMarginSkus: 2,
};

const PricingOptimization = () => {
  const [mode, setMode] = useState("ai");
  const [activeTab, setActiveTab] = useState("overview");

  const {
    scenarios,
    recommendations,
    insights,
    totalSkus,
    avgMargin,
    highMarginSkus,
  } = staticPricingData;

  const [isGenerating, setIsGenerating] = useState(false);

  const optimizationOpportunities = recommendations.filter(
    (r) => r.recommended_price > (r.skus?.price || 0) * 1.1,
  ).length;

  const handleGenerateRecommendations = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Pricing Optimization
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-driven pricing strategies and scenario analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={mode === "ai" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMode("ai")}
                className="text-xs"
              >
                <Bot className="w-3 h-3 mr-1" />
                AI Mode
              </Button>
              <Button
                variant={mode === "custom" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMode("custom")}
                className="text-xs"
              >
                <Target className="w-3 h-3 mr-1" />
                Custom
              </Button>
            </div>
            <Button
              onClick={handleGenerateRecommendations}
              disabled={isGenerating}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Zap className="w-4 h-4 mr-1" />
              {isGenerating ? "Analyzing..." : "Generate AI Recommendations"}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FinancialCard
            title="Total SKUs"
            value={totalSkus}
            change={0}
            icon={<BarChart3 className="h-4 w-4" />}
            variant="default"
          />
          <FinancialCard
            title="Avg. Margin"
            value={`${avgMargin.toFixed(1)}%`}
            change={0}
            icon={<TrendingUp className="h-4 w-4" />}
            variant="revenue"
          />
          <FinancialCard
            title="High Margin SKUs"
            value={highMarginSkus}
            change={0}
            icon={<DollarSign className="h-4 w-4" />}
            variant="revenue"
          />
          <FinancialCard
            title="Optimization Opportunities"
            value={optimizationOpportunities}
            change={0}
            icon={<Lightbulb className="h-4 w-4" />}
            variant="default"
          />
        </div>

        {/* Active Insights */}
        {insights.length > 0 && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Lightbulb className="h-5 w-5" />
                Active Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {insights.slice(0, 3).map((insight) => (
                  <Badge
                    key={insight.id}
                    variant={
                      insight.priority === "high" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {insight.title}
                  </Badge>
                ))}
                {insights.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{insights.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs with Pre-rendered Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="recommendations">
              AI Recommendations
            </TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Pre-render all content but show/hide based on active tab for instant switching */}
          <div className="space-y-6">
            <div className={activeTab === "overview" ? "block" : "hidden"}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PricingComparison />
                <PricingCharts />
              </div>
            </div>

            <div className={activeTab === "scenarios" ? "block" : "hidden"}>
              <PricingScenarios mode={mode} scenarios={scenarios} />
            </div>

            <div
              className={activeTab === "recommendations" ? "block" : "hidden"}
            >
              <AIRecommendations recommendations={recommendations} />
            </div>

            <div className={activeTab === "insights" ? "block" : "hidden"}>
              <PricingInsights insights={insights} />
            </div>

            <div className={activeTab === "analytics" ? "block" : "hidden"}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PricingCharts />
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Detailed pricing performance analytics coming soon...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </>
  );
};

export default PricingOptimization;
