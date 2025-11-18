import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, TrendingUp, Edit, Trash2 } from "lucide-react";

const staticScenarios = [
    { id: 's1', name: 'Aggressive Growth', description: '15% price increase across all products.', impact: { revenue: '+25%', profit: '+15%' }, status: 'active' },
    { id: 's2', name: 'Market Penetration', description: '10% price decrease for new product lines.', impact: { revenue: '+5%', profit: '-5%' }, status: 'draft' },
    { id: 's3', name: 'Competitor Match', description: 'Match prices with top 3 competitors.', impact: { revenue: '+10%', profit: '+2%' }, status: 'archived' },
];

export function PricingScenarios({ mode, scenarios: propScenarios }) {
  const scenarios = propScenarios || staticScenarios;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Scenarios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-lg flex items-center gap-2">
                {scenario.name}
                <Badge variant={scenario.status === 'active' ? 'default' : 'outline'}>{scenario.status}</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">{scenario.description}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-green-500" /> Revenue: {scenario.impact.revenue}</span>
                <span className="flex items-center gap-1"><Rocket className="w-4 h-4 text-blue-500" /> Profit: {scenario.impact.profit}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

