import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calculator, RotateCcw } from 'lucide-react';

interface CashFlowProjection {
  month: string;
  inflow: number;
  outflow: number;
  balance: number;
  recurringExpenses: number;
  oneTimeExpenses: number;
}

interface ScenarioParams {
  revenueChange: number; // percentage
  expenseChange: number; // percentage
  oneTimeRevenue: number; // absolute amount
  oneTimeExpense: number; // absolute amount
  startMonth: number; // 0-based index
}

interface CashFlowScenariosProps {
  baseProjections: CashFlowProjection[];
}

export function CashFlowScenarios({ baseProjections }: CashFlowScenariosProps) {
  const [activeScenario, setActiveScenario] = useState<string>('optimistic');
  const [customParams, setCustomParams] = useState<ScenarioParams>({
    revenueChange: 0,
    expenseChange: 0,
    oneTimeRevenue: 0,
    oneTimeExpense: 0,
    startMonth: 0,
  });

  const scenarios = useMemo(() => {
    const applyScenario = (projections: CashFlowProjection[], params: ScenarioParams) => {
      let runningBalance = projections[0]?.balance || 0;
      
      return projections.map((projection, index) => {
        const adjustedInflow = index >= params.startMonth
          ? projection.inflow * (1 + params.revenueChange / 100) + (index === params.startMonth ? params.oneTimeRevenue : 0)
          : projection.inflow;
        
        const adjustedOutflow = index >= params.startMonth
          ? projection.outflow * (1 + params.expenseChange / 100) + (index === params.startMonth ? params.oneTimeExpense : 0)
          : projection.outflow;

        const netFlow = adjustedInflow - adjustedOutflow;
        runningBalance = index === 0 ? runningBalance + netFlow : runningBalance + netFlow;

        return {
          ...projection,
          inflow: adjustedInflow,
          outflow: adjustedOutflow,
          balance: runningBalance,
        };
      });
    };

    return {
      base: baseProjections,
      optimistic: applyScenario(baseProjections, {
        revenueChange: 20,
        expenseChange: -10,
        oneTimeRevenue: 0,
        oneTimeExpense: 0,
        startMonth: 1,
      }),
      pessimistic: applyScenario(baseProjections, {
        revenueChange: -15,
        expenseChange: 10,
        oneTimeRevenue: 0,
        oneTimeExpense: 0,
        startMonth: 1,
      }),
      conservative: applyScenario(baseProjections, {
        revenueChange: 5,
        expenseChange: 5,
        oneTimeRevenue: 0,
        oneTimeExpense: 0,
        startMonth: 1,
      }),
      custom: applyScenario(baseProjections, customParams),
    };
  }, [baseProjections, customParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'optimistic': return 'text-green-600';
      case 'pessimistic': return 'text-red-600';
      case 'conservative': return 'text-blue-600';
      case 'custom': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getScenarioDescription = (scenario: string) => {
    switch (scenario) {
      case 'optimistic': return '+20% revenue, -10% expenses';
      case 'pessimistic': return '-15% revenue, +10% expenses';
      case 'conservative': return '+5% revenue, +5% expenses';
      case 'custom': return 'Custom parameters';
      default: return 'Current projections';
    }
  };

  const resetCustomParams = () => {
    setCustomParams({
      revenueChange: 0,
      expenseChange: 0,
      oneTimeRevenue: 0,
      oneTimeExpense: 0,
      startMonth: 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Scenario Planning
        </CardTitle>
        <CardDescription>
          Analyze different business scenarios and their impact on cash flow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeScenario} onValueChange={setActiveScenario}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="base">Base</TabsTrigger>
            <TabsTrigger value="optimistic">Optimistic</TabsTrigger>
            <TabsTrigger value="pessimistic">Pessimistic</TabsTrigger>
            <TabsTrigger value="conservative">Conservative</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {Object.entries(scenarios).map(([key, projections]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold capitalize">{key} Scenario</h3>
                  <p className="text-sm text-muted-foreground">
                    {getScenarioDescription(key)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">12-Month Balance</div>
                  <div className={`text-lg font-bold ${projections[projections.length - 1]?.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(projections[projections.length - 1]?.balance || 0)}
                  </div>
                </div>
              </div>

              {key === 'custom' && (
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/10">
                  <div className="space-y-2">
                    <Label htmlFor="revenueChange">Revenue Change (%)</Label>
                    <Input
                      id="revenueChange"
                      type="number"
                      value={customParams.revenueChange}
                      onChange={(e) => setCustomParams(prev => ({ ...prev, revenueChange: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expenseChange">Expense Change (%)</Label>
                    <Input
                      id="expenseChange"
                      type="number"
                      value={customParams.expenseChange}
                      onChange={(e) => setCustomParams(prev => ({ ...prev, expenseChange: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oneTimeRevenue">One-time Revenue ($)</Label>
                    <Input
                      id="oneTimeRevenue"
                      type="number"
                      value={customParams.oneTimeRevenue}
                      onChange={(e) => setCustomParams(prev => ({ ...prev, oneTimeRevenue: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oneTimeExpense">One-time Expense ($)</Label>
                    <Input
                      id="oneTimeExpense"
                      type="number"
                      value={customParams.oneTimeExpense}
                      onChange={(e) => setCustomParams(prev => ({ ...prev, oneTimeExpense: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startMonth">Start Month</Label>
                    <Select
                      value={customParams.startMonth.toString()}
                      onValueChange={(value) => setCustomParams(prev => ({ ...prev, startMonth: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {projections.map((_, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {projections[index].month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" size="sm" onClick={resetCustomParams}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Month</th>
                      <th className="text-right p-2">Inflow</th>
                      <th className="text-right p-2">Outflow</th>
                      <th className="text-right p-2">Net Flow</th>
                      <th className="text-right p-2">Balance</th>
                      <th className="text-center p-2">vs Base</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projections.slice(0, 6).map((projection, index) => {
                      const baseProjection = scenarios.base[index];
                      const balanceDiff = projection.balance - baseProjection.balance;
                      const netFlow = projection.inflow - projection.outflow;
                      
                      return (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{projection.month}</td>
                          <td className="p-2 text-right text-green-600">{formatCurrency(projection.inflow)}</td>
                          <td className="p-2 text-right text-red-600">{formatCurrency(projection.outflow)}</td>
                          <td className={`p-2 text-right font-medium ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(netFlow)}
                          </td>
                          <td className={`p-2 text-right font-bold ${projection.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(projection.balance)}
                          </td>
                          <td className="p-2 text-center">
                            {key !== 'base' && (
                              <Badge variant={balanceDiff >= 0 ? 'default' : 'secondary'}>
                                {balanceDiff >= 0 ? '+' : ''}{formatCurrency(balanceDiff)}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {projections.length > 6 && (
                <div className="text-center text-sm text-muted-foreground">
                  Showing first 6 months • Full analysis available in export
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}