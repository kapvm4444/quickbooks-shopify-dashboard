import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PricingRecommendationsSkeleton } from "./PricingSkeletons";
import { 
  Bot, 
  TrendingUp, 
  DollarSign, 
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  Lightbulb,
  Package
} from "lucide-react";
import { usePricingData } from "@/hooks/usePricingData";

export const AIRecommendations = React.memo(() => {
  const { recommendations, recommendationsLoading } = usePricingData();

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'optimize': return <Target className="h-4 w-4" />;
      case 'bundle': return <Package className="h-4 w-4" />;
      case 'seasonal': return <TrendingUp className="h-4 w-4" />;
      case 'upsell': return <ArrowUp className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'optimize': return 'bg-blue-500';
      case 'bundle': return 'bg-green-500';
      case 'seasonal': return 'bg-orange-500';
      case 'upsell': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriceChangeDirection = (current: number, recommended: number) => {
    if (recommended > current * 1.05) return 'up';
    if (recommended < current * 0.95) return 'down';
    return 'same';
  };

  const getPriceChangeIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowUp className="h-3 w-3 text-green-600" />;
      case 'down': return <ArrowDown className="h-3 w-3 text-red-600" />;
      default: return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  if (recommendationsLoading) {
    return <PricingRecommendationsSkeleton />;
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Bot className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">No AI recommendations yet</h3>
              <p className="text-muted-foreground">
                Click "Generate AI Recommendations" to analyze your pricing opportunities
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
          <h2 className="text-xl font-semibold">AI Pricing Recommendations</h2>
          <p className="text-sm text-muted-foreground">
            AI-generated pricing optimizations based on your product data
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Bot className="h-3 w-3" />
          {recommendations.length} recommendations
        </Badge>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => {
          const currentPrice = recommendation.skus?.price || 0;
          const recommendedPrice = recommendation.recommended_price;
          const priceChange = ((recommendedPrice - currentPrice) / currentPrice) * 100;
          const direction = getPriceChangeDirection(currentPrice, recommendedPrice);

          return (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`p-1 rounded ${getRecommendationColor(recommendation.recommendation_type)}`}>
                        {getRecommendationIcon(recommendation.recommendation_type)}
                      </div>
                      {recommendation.skus?.name || 'Unknown SKU'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      SKU: {recommendation.skus?.sku}
                    </p>
                  </div>
                  <Badge 
                    variant={recommendation.confidence_score > 80 ? 'default' : 'secondary'}
                  >
                    {recommendation.confidence_score}% confidence
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Price Comparison */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="text-xs text-muted-foreground">Current Price</div>
                    <div className="text-lg font-semibold">${currentPrice.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      Margin: {recommendation.skus?.price > 0 
                        ? (((recommendation.skus.price - (recommendation.skus.cost || 0)) / recommendation.skus.price) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      Recommended Price
                      {getPriceChangeIcon(direction)}
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      ${recommendedPrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Margin: {recommendation.expected_margin_percent?.toFixed(1) || 0}%
                    </div>
                  </div>
                </div>

                {/* Expected Impact */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expected ROI</span>
                    <span className="font-medium">
                      {recommendation.expected_roi?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price Change</span>
                    <span className={`font-medium flex items-center gap-1 ${
                      priceChange > 0 ? 'text-green-600' : priceChange < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {getPriceChangeIcon(direction)}
                      {Math.abs(priceChange).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence Score</span>
                    <span className="font-medium">{recommendation.confidence_score}%</span>
                  </div>
                  <Progress value={recommendation.confidence_score} className="h-1" />
                </div>

                {/* Reasoning */}
                {recommendation.reasoning && (
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {recommendation.reasoning}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant="outline" className="text-xs">
                    {recommendation.recommendation_type}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Apply to Scenario
                    </Button>
                    <Button size="sm">
                      Apply Pricing
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
});