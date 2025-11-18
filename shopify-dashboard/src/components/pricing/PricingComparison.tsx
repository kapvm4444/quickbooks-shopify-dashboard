import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePricingData } from "@/hooks/usePricingData";
import { useBusinessData } from "@/hooks/business/useBusinessData";
import { TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";

export const PricingComparison = React.memo(() => {
  const { scenarios } = usePricingData();
  const { isLoading } = useBusinessData();
  const [selectedScenario1, setSelectedScenario1] = useState<string>('current');
  const [selectedScenario2, setSelectedScenario2] = useState<string>('');

  // Calculate current pricing metrics (placeholder)
  const currentMetrics = {
    totalRevenue: 0,
    avgMargin: 0,
    totalProducts: 0,
    highMarginProducts: 0
  };

  const scenarios_options = [
    { value: 'current', label: 'Current Pricing', isAi: false },
    ...scenarios.map(scenario => ({
      value: scenario.id,
      label: scenario.name,
      isAi: scenario.is_ai_generated
    }))
  ];

  const getScenarioMetrics = (scenarioId: string) => {
    if (scenarioId === 'current') {
      return currentMetrics;
    }
    
    // TODO: Calculate metrics for selected scenario
    // This would involve fetching scenario_sku_pricing and calculating projections
    return {
      totalRevenue: currentMetrics.totalRevenue * 1.15, // Placeholder
      avgMargin: currentMetrics.avgMargin + 5,
      totalProducts: currentMetrics.totalProducts,
      highMarginProducts: currentMetrics.highMarginProducts + 2
    };
  };

  const scenario1Metrics = getScenarioMetrics(selectedScenario1);
  const scenario2Metrics = selectedScenario2 ? getScenarioMetrics(selectedScenario2) : null;

  const calculateDifference = (current: number, comparison: number) => {
    if (comparison === 0) return 0;
    return ((comparison - current) / current) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Scenario Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Primary Scenario</label>
            <Select value={selectedScenario1} onValueChange={setSelectedScenario1}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scenarios_options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.label}
                      {option.isAi && (
                        <Badge variant="secondary" className="text-xs">AI</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Compare With</label>
            <Select value={selectedScenario2} onValueChange={setSelectedScenario2}>
              <SelectTrigger>
                <SelectValue placeholder="Select scenario to compare" />
              </SelectTrigger>
              <SelectContent>
                {scenarios_options
                  .filter(option => option.value !== selectedScenario1)
                  .map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.label}
                        {option.isAi && (
                          <Badge variant="secondary" className="text-xs">AI</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparison Results */}
        {scenario2Metrics && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Revenue</span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    ${scenario1Metrics.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    vs ${scenario2Metrics.totalRevenue.toLocaleString()}
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    calculateDifference(scenario1Metrics.totalRevenue, scenario2Metrics.totalRevenue) > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    {Math.abs(calculateDifference(scenario1Metrics.totalRevenue, scenario2Metrics.totalRevenue)).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Average Margin */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Avg Margin</span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    {scenario1Metrics.avgMargin.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    vs {scenario2Metrics.avgMargin.toFixed(1)}%
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    calculateDifference(scenario1Metrics.avgMargin, scenario2Metrics.avgMargin) > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    {Math.abs(calculateDifference(scenario1Metrics.avgMargin, scenario2Metrics.avgMargin)).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* High Margin Products */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">High Margin SKUs</span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    {scenario1Metrics.highMarginProducts}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    vs {scenario2Metrics.highMarginProducts}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((scenario1Metrics.highMarginProducts / scenario1Metrics.totalProducts) * 100).toFixed(0)}% of total
                  </div>
                </div>
              </div>

              {/* Total Products */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Products</span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    {scenario1Metrics.totalProducts}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    vs {scenario2Metrics.totalProducts}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Active SKUs
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Comparison Summary</h4>
              <p className="text-sm text-muted-foreground">
                {selectedScenario2 !== 'current' && scenarios.find(s => s.id === selectedScenario2)?.name} 
                {selectedScenario2 === 'current' && 'Current pricing'} shows{' '}
                {calculateDifference(scenario1Metrics.totalRevenue, scenario2Metrics.totalRevenue) > 0 
                  ? 'higher' : 'lower'} revenue potential with{' '}
                {calculateDifference(scenario1Metrics.avgMargin, scenario2Metrics.avgMargin) > 0 
                  ? 'improved' : 'reduced'} average margins compared to{' '}
                {selectedScenario1 === 'current' ? 'current pricing' : scenarios.find(s => s.id === selectedScenario1)?.name}.
              </p>
            </div>
          </div>
        )}

        {!selectedScenario2 && (
          <div className="p-8 text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Select a second scenario to compare pricing strategies</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});