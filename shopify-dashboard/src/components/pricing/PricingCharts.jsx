import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const priceElasticityData = [
    { category: 'Electronics', elasticity: -1.2 },
    { category: 'Office Supplies', elasticity: -2.5 },
    { category: 'Furniture', elasticity: -0.8 },
    { category: 'Accessories', elasticity: -1.8 },
];

export function PricingCharts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Elasticity by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={priceElasticityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="elasticity" fill="#8884d8" name="Price Elasticity" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

