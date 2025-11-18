import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const staticRecommendations = [
    { id: 'r1', skus: { id: 'SKU002', name: 'Mechanical Keyboard', price: 120 }, recommended_price: 135, reason: 'High demand and low price elasticity.' },
    { id: 'r2', skus: { id: 'SKU001', name: 'Wireless Mouse', price: 25 }, recommended_price: 29.99, reason: 'Market average is higher.' },
    { id: 'r3', skus: { id: 'SKU005', name: 'USB-C Hub', price: 45 }, recommended_price: 49.99, reason: 'Opportunity to increase margin on high-volume item.' },
];

export function AIRecommendations({ recommendations: propRecommendations }) {
  const recommendations = propRecommendations || staticRecommendations;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{rec.skus.name}</h4>
                <p className="text-sm text-muted-foreground">SKU: {rec.skus.id}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-green-500"><Check className="w-4 h-4 mr-1" /> Accept</Button>
                <Button variant="outline" size="sm" className="text-red-500"><X className="w-4 h-4 mr-1" /> Reject</Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="font-semibold">${rec.skus.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recommended Price</p>
                <p className="font-semibold text-green-600">${rec.recommended_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potential Uplift</p>
                <p className="font-semibold text-green-600">+${(rec.recommended_price - rec.skus.price).toFixed(2)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4"><strong>Reason:</strong> {rec.reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

