import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useBusinessData } from "@/hooks/business/useBusinessData";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { Package, FileText } from "lucide-react";

interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_name: string;
  status: string;
  total_amount: number;
  order_date: string;
}

export const POReference = () => {
  const businessData = useBusinessData();
  const { data: purchaseOrders } = useSupabaseQuery<PurchaseOrder>(
    ['purchase-orders'],
    'purchase_orders',
    'id, po_number, vendor_name, status, total_amount, order_date'
  );

  if (businessData.isLoading) {
    return <div>Loading PO reference data...</div>;
  }

  // Group SKUs by their purchase orders
  const skuPOMapping = businessData.skuList?.reduce((acc, sku) => {
    if (sku.current_po_number) {
      if (!acc[sku.current_po_number]) {
        acc[sku.current_po_number] = [];
      }
      acc[sku.current_po_number].push(sku);
    }
    return acc;
  }, {} as Record<string, typeof businessData.skuList>) || {};

  const getStatusBadgeVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'received') return 'default';
    if (statusLower === 'pending') return 'secondary';
    if (statusLower === 'in production' || statusLower === 'tooling') return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <CardTitle>Purchase Order SKU Reference</CardTitle>
          </div>
          <CardDescription>
            View how SKUs are connected to purchase orders across your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(skuPOMapping).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">No PO connections found</p>
                <p className="text-sm">SKUs will appear here once they are linked to purchase orders.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(skuPOMapping).map(([poNumber, skus]) => {
                const po = purchaseOrders?.find(p => p.po_number === poNumber);
                return (
                  <Card key={poNumber} className="border-l-4 border-l-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">PO #{poNumber}</CardTitle>
                          <CardDescription>
                            {po ? `${po.vendor_name} • ${new Date(po.order_date).toLocaleDateString()}` : 'Purchase Order Details'}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {po && (
                            <>
                              <Badge variant={getStatusBadgeVariant(po.status)}>
                                {po.status}
                              </Badge>
                              <span className="text-sm font-medium">${po.total_amount.toFixed(2)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Total Value</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(skus as any[])?.map((sku) => (
                            <TableRow key={sku.id}>
                              <TableCell className="font-medium">{sku.sku}</TableCell>
                              <TableCell>{sku.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{sku.category || 'Uncategorized'}</Badge>
                              </TableCell>
                              <TableCell>${sku.price?.toFixed(2) || '0.00'}</TableCell>
                              <TableCell>{sku.quantity || 0}</TableCell>
                              <TableCell className="font-medium">
                                ${((sku.price || 0) * (sku.quantity || 0)).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={sku.status === 'active' ? 'default' : 'secondary'}>
                                  {sku.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};