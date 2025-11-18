import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const competitorData = [
    { sku: 'SKU001', ourPrice: 25.00, competitorA: 28.00, competitorB: 27.50, marketAvg: 27.75 },
    { sku: 'SKU002', ourPrice: 120.00, competitorA: 115.00, competitorB: 125.00, marketAvg: 120.00 },
    { sku: 'SKU003', ourPrice: 5.00, competitorA: 5.50, competitorB: 4.99, marketAvg: 5.25 },
    { sku: 'SKU004', ourPrice: 250.00, competitorA: 275.00, competitorB: 260.00, marketAvg: 267.50 },
];

export function PricingComparison() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitor Price Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Our Price</TableHead>
              <TableHead>Competitor A</TableHead>
              <TableHead>Competitor B</TableHead>
              <TableHead>Market Avg</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitorData.map((row) => (
              <TableRow key={row.sku}>
                <TableCell>{row.sku}</TableCell>
                <TableCell className="font-semibold">${row.ourPrice.toFixed(2)}</TableCell>
                <TableCell>${row.competitorA.toFixed(2)}</TableCell>
                <TableCell>${row.competitorB.toFixed(2)}</TableCell>
                <TableCell>${row.marketAvg.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

