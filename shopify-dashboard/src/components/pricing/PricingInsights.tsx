import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PricingInsightsSkeleton } from "./PricingSkeletons";
import { 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Calendar,
  X,
  CheckCircle,
  Lightbulb
} from "lucide-react";
import { usePricingData } from "@/hooks/usePricingData";

export const PricingInsights = React.memo(() => {
  const { insights, insightsLoading, dismissInsight } = usePricingData();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'high_margin': return <TrendingUp className="h-5 w-5" />;
      case 'underperforming': return <AlertTriangle className="h-5 w-5" />;
      case 'bundle_opportunity': return <Package className="h-5 w-5" />;
      case 'seasonal': return <Calendar className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') {
      switch (type) {
        case 'high_margin': return 'border-l-green-500 bg-green-50/50';
        case 'underperforming': return 'border-l-red-500 bg-red-50/50';
        case 'bundle_opportunity': return 'border-l-blue-500 bg-blue-50/50';
        case 'seasonal': return 'border-l-orange-500 bg-orange-50/50';
        default: return 'border-l-gray-500 bg-gray-50/50';
      }
    }
    return 'border-l-gray-300 bg-gray-50/30';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case 'medium': return <Badge variant="default" className="text-xs">Medium Priority</Badge>;
      case 'low': return <Badge variant="secondary" className="text-xs">Low Priority</Badge>;
      default: return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const handleDismissInsight = (insightId: string) => {
    dismissInsight.mutate(insightId);
  };

  if (insightsLoading) {
    return <PricingInsightsSkeleton />;
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Lightbulb className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">No active insights</h3>
              <p className="text-muted-foreground">
                Generate AI recommendations to receive pricing insights and optimization opportunities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pricing Insights</h2>
          <p className="text-sm text-muted-foreground">
            AI-generated insights and optimization opportunities
          </p>
        </div>
        <Badge variant="secondary">
          {insights.length} active insights
        </Badge>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <Card 
            key={insight.id} 
            className={`border-l-4 ${getInsightColor(insight.insight_type, insight.priority)}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-background">
                    {getInsightIcon(insight.insight_type)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(insight.priority)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissInsight(insight.id)}
                    disabled={dismissInsight.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Affected SKUs */}
              {insight.affected_skus && Array.isArray(insight.affected_skus) && insight.affected_skus.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Affected Products</h4>
                  <div className="flex flex-wrap gap-2">
                    {insight.affected_skus.slice(0, 5).map((sku: any, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {sku.name || sku.sku || `Product ${index + 1}`}
                      </Badge>
                    ))}
                    {insight.affected_skus.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{insight.affected_skus.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Created {new Date(insight.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-4">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Mark as Implemented
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});