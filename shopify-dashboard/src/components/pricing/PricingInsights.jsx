import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

const staticInsights = [
    { id: 'i1', title: 'High elasticity for "Office Supplies"', priority: 'high', description: 'A 10% price decrease could lead to a 25% increase in sales volume for this category.' },
    { id: 'i2', title: 'Underpriced in "Electronics" category', priority: 'medium', description: 'Competitor analysis shows our electronics are priced 15% below market average.' },
    { id: 'i3', title: 'Weekend pricing strategy shows 10% lift', priority: 'low', description: 'Consider implementing dynamic pricing for weekends to capture more revenue.' },
];

export function PricingInsights({ insights: propInsights }) {
  const insights = propInsights || staticInsights;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                {insight.title}
              </h4>
              <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>{insight.priority}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{insight.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

