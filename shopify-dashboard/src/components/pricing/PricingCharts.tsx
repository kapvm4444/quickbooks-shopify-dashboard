import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useBusinessData } from "@/hooks/business/useBusinessData";
import { usePricingData } from "@/hooks/usePricingData";
import { TrendingUp, BarChart3 } from "lucide-react";

export const PricingCharts = React.memo(() => {
  const { isLoading } = useBusinessData();
  const { recommendations } = usePricingData();

  // Empty margin distribution data
  const marginDistributionData: { range: string; count: number }[] = [];

  // Prepare pricing impact data from recommendations
  const pricingImpactData = recommendations.slice(0, 10).map(rec => ({
    sku: rec.skus?.name?.substring(0, 15) + '...' || 'Unknown',
    currentPrice: rec.skus?.price || 0,
    recommendedPrice: rec.recommended_price,
    currentMargin: rec.skus?.price > 0 
      ? (((rec.skus.price - (rec.skus.cost || 0)) / rec.skus.price) * 100)
      : 0,
    projectedMargin: rec.expected_margin_percent || 0
  }));

  // Empty historical data
  const historicalData: { month: string; avgPrice: number; avgMargin: number; revenue: number }[] = [];

  return (
    <div className="space-y-6">
      {/* Historical Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historical Pricing Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-muted-foreground">
            <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No historical data</h3>
            <p className="text-sm">Connect your pricing data to see historical performance trends</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margin Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Margin Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No margin data</h3>
              <p className="text-sm">Add product pricing to see margin distribution</p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Impact Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Price Optimization Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No optimization data</h3>
              <p className="text-sm">Add SKUs and pricing to see optimization impact</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});