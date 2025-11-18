import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

interface LineItem {
  id?: string;
  sku_id: string | null;
  sku_name?: string;
  sku_code?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
  custom_description?: string;
  is_other_item?: boolean;
}

interface PurchaseOrderLineItemsManagerProps {
  purchaseOrderId: string;
  isEditing: boolean;
  onTotalChange?: (total: number) => void;
}

export const PurchaseOrderLineItemsManager = ({ 
  purchaseOrderId, 
  isEditing, 
  onTotalChange 
}: PurchaseOrderLineItemsManagerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<LineItem>>({
    sku_id: '',
    quantity: 1,
    unit_cost: 0,
    total_cost: 0,
    notes: '',
    custom_description: '',
    is_other_item: false
  });

  // Fetch available SKUs from financial_records
  const { data: skuRecords, error: skusError, isLoading: skusLoading } = useSupabaseQuery<any>(
    ['financial-records-skus', user?.id],
    'financial_records',
    '*',
    user?.id ? { user_id: user.id, record_type: 'sku' } : undefined
  );

  // Transform financial records to SKU format
  const skus = skuRecords?.map((record: any) => {
    const originalRow = record.metadata?.original_row || [];
    return {
      id: record.id,
      sku: originalRow[0] || record.description,
      name: originalRow[1] || record.metadata?.name || 'Unknown',
      cost: record.metadata?.cost_price || 0,
      price: record.amount || 0
    };
  }) || [];

  console.log('PurchaseOrderLineItemsManager Debug:', {
    user: user?.id,
    skus: skus,
    skusError: skusError,
    skusLoading: skusLoading,
    skusCount: skus?.length || 0
  });

  // Fetch existing line items
  const { data: existingLineItems, refetch } = useSupabaseQuery<any>(
    ['purchase_order_line_items', purchaseOrderId],
    'purchase_order_line_items',
    '*',
    { po_id: purchaseOrderId }
  );

  useEffect(() => {
    if (existingLineItems && skus) {
      const items = existingLineItems.map((item: any) => {
        const sku = skus.find(s => s.id === item.sku_id);
        const isOtherItem = item.sku_id === null;
        return {
          id: item.id,
          sku_id: item.sku_id,
          sku_name: isOtherItem ? 'Other - Custom Item' : (sku?.name || 'Unknown'),
          sku_code: isOtherItem ? 'OTHER' : (sku?.sku || 'Unknown'),
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
          notes: item.notes,
          custom_description: item.custom_description,
          is_other_item: isOtherItem
        };
      });
      setLineItems(items);
      
      // Calculate total and notify parent
      const total = items.reduce((sum: number, item: LineItem) => sum + item.total_cost, 0);
      onTotalChange?.(total);
    }
  }, [existingLineItems, skus, onTotalChange]);

  const handleNewItemChange = (field: keyof LineItem, value: string | number) => {
    setNewItem(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate total cost when quantity or unit cost changes
      if (field === 'quantity' || field === 'unit_cost') {
        const quantity = field === 'quantity' ? value as number : (prev.quantity || 0);
        const unitCost = field === 'unit_cost' ? value as number : (prev.unit_cost || 0);
        updated.total_cost = quantity * unitCost;
      }
      
      return updated;
    });
  };

  const handleSKUSelect = (skuId: string) => {
    if (skuId === 'OTHER') {
      setNewItem(prev => ({
        ...prev,
        sku_id: null,
        unit_cost: 0,
        total_cost: (prev.quantity || 1) * 0,
        is_other_item: true,
        custom_description: prev.custom_description || ''
      }));
    } else {
      const selectedSku = skus?.find(s => s.id === skuId);
      if (selectedSku) {
        setNewItem(prev => ({
          ...prev,
          sku_id: skuId,
          unit_cost: selectedSku.cost || 0,
          total_cost: (prev.quantity || 1) * (selectedSku.cost || 0),
          is_other_item: false,
          custom_description: ''
        }));
      }
    }
  };

  const addLineItem = async () => {
    if ((!newItem.sku_id && newItem.sku_id !== null) || !user) return;
    
    // For "OTHER" items, require a custom description
    if (newItem.sku_id === null && (!newItem.custom_description || newItem.custom_description.trim() === '')) {
      toast({
        title: "Error",
        description: "Please provide a description for the custom item.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('purchase_order_line_items')
        .insert({
          user_id: user.id,
          po_id: purchaseOrderId,
          sku_id: newItem.sku_id,
          quantity: newItem.quantity || 1,
          unit_cost: newItem.unit_cost || 0,
          total_cost: newItem.total_cost || 0,
          notes: newItem.notes,
          custom_description: newItem.custom_description
        })
        .select('*')
        .single();

      if (error) throw error;

      const sku = skus?.find(s => s.id === data.sku_id);
      const isOtherItem = data.sku_id === null;
      const newLineItem: LineItem = {
        id: data.id,
        sku_id: data.sku_id,
        sku_name: isOtherItem ? 'Other - Custom Item' : (sku?.name || 'Unknown'),
        sku_code: isOtherItem ? 'OTHER' : (sku?.sku || 'Unknown'),
        quantity: data.quantity,
        unit_cost: data.unit_cost,
        total_cost: data.total_cost,
        notes: data.notes,
        custom_description: data.custom_description,
        is_other_item: isOtherItem
      };

      setLineItems(prev => [...prev, newLineItem]);
      setNewItem({
        sku_id: '',
        quantity: 1,
        unit_cost: 0,
        total_cost: 0,
        notes: '',
        custom_description: '',
        is_other_item: false
      });

      // Update PO reference in SKU (only for real SKUs, not OTHER items)
      if (!isOtherItem && sku?.sku) {
        await supabase
          .from('skus')
          .update({ current_po_number: purchaseOrderId })
          .eq('id', newItem.sku_id);
      }

      toast({
        title: "Success",
        description: "Line item added successfully.",
      });

      refetch();
    } catch (error) {
      console.error('Error adding line item:', error);
      toast({
        title: "Error",
        description: "Failed to add line item.",
        variant: "destructive",
      });
    }
  };

  const removeLineItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('purchase_order_line_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setLineItems(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: "Success",
        description: "Line item removed successfully.",
      });

      refetch();
    } catch (error) {
      console.error('Error removing line item:', error);
      toast({
        title: "Error",
        description: "Failed to remove line item.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Purchase Order Line Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Line Items */}
        {lineItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total</TableHead>
                {isEditing && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{item.sku_code}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.is_other_item && item.custom_description 
                          ? item.custom_description 
                          : item.sku_name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.unit_cost.toFixed(2)}</TableCell>
                  <TableCell>${item.total_cost.toFixed(2)}</TableCell>
                  {isEditing && (
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => item.id && removeLineItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No line items added yet.
          </p>
        )}

        {/* Add New Line Item */}
        {isEditing && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-medium">Add Line Item</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SKU</Label>
                <Select 
                  value={newItem.sku_id === null ? 'OTHER' : (newItem.sku_id || '')} 
                  onValueChange={handleSKUSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={skusLoading ? "Loading SKUs..." : "Select SKU or Other"} />
                  </SelectTrigger>
                  <SelectContent>
                    {skusLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="OTHER">Other - Custom Item</SelectItem>
                        {(!skus || skus.length === 0) ? (
                          <SelectItem value="no-skus" disabled>No SKUs found. Go to SKU List to create SKUs first.</SelectItem>
                        ) : (
                          skus.map((sku) => (
                            <SelectItem key={sku.id} value={sku.id}>
                              {sku.sku} - {sku.name}
                            </SelectItem>
                          ))
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity || ''}
                  onChange={(e) => handleNewItemChange('quantity', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            {/* Custom Description Field for Other Items */}
            {newItem.sku_id === null && (
              <div>
                <Label>Item Description *</Label>
                <Input
                  type="text"
                  placeholder="e.g., Die Cut for Packaging, Setup Fee, etc."
                  value={newItem.custom_description || ''}
                  onChange={(e) => handleNewItemChange('custom_description', e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unit Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.unit_cost || ''}
                  onChange={(e) => handleNewItemChange('unit_cost', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>Total Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newItem.total_cost?.toFixed(2) || '0.00'}
                  disabled
                />
              </div>
            </div>

            <Button
              onClick={addLineItem}
              disabled={(!newItem.sku_id && newItem.sku_id !== null) || (newItem.sku_id === null && (!newItem.custom_description || newItem.custom_description.trim() === ''))}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Line Item
            </Button>
          </div>
        )}

        {/* Total Summary */}
        {lineItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center font-medium">
              <span>Total Amount:</span>
              <span>${lineItems.reduce((sum, item) => sum + item.total_cost, 0).toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
