import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Save, Edit2, Plus } from "lucide-react";
import { useBusinessData } from "@/hooks/business/useBusinessData";
import { useSKUCostDetails, useCreateSKUCostDetail, useUpdateSKUCostDetail, SKUCostInput } from "@/hooks/useSKUCostDetails";
import { useUnitEconomicsCalculations } from "@/hooks/useUnitEconomicsCalculations";
import { useUpdateSKU } from "@/hooks/useSKUData";
import { AddSKUDialog } from "./AddSKUDialog";
import { formatExactCurrency, formatExactNumber } from "@/utils/formatters/numberFormatters";

export const SKUCostManagement = () => {
  const businessData = useBusinessData();
  const { data: costDetails } = useSKUCostDetails();
  const { analytics } = useUnitEconomicsCalculations();
  const createCostDetail = useCreateSKUCostDetail();
  const updateCostDetail = useUpdateSKUCostDetail();
  const updateSKU = useUpdateSKU();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPONumber, setEditingPONumber] = useState<string>("");
  const [editData, setEditData] = useState<SKUCostInput>({
    sku_id: "",
    unit_cost: 0,
    packaging_cost: 0,
    shipping_cost: 0,
    warehousing_cost: 0,
    duties_customs_cost: 0,
    pick_pack_cost: 0,
    storage_cost: 0,
    outbound_shipping_cost: 0,
    labor_cost: 0,
    assembly_cost: 0,
    export_cost: 0,
    quality_control_cost: 0,
    compliance_cost: 0,
    other_cost_1: 0,
    other_cost_1_description: "",
    other_cost_2: 0,
    other_cost_2_description: "",
    target_margin_percent: 0,
    notes: "",
  });

  const costDetailsMap = new Map(costDetails?.map(cd => [cd.sku_id, cd]) || []);

  const handleEdit = (skuId: string) => {
    const currentSKU = businessData.skuList?.find(s => s.id === skuId);
    const existingCost = costDetailsMap.get(skuId);
    
    // Set the PO number from the SKU data
    setEditingPONumber(currentSKU?.current_po_number || "");
    
    if (existingCost) {
      setEditData({
        sku_id: skuId,
        unit_cost: existingCost.unit_cost,
        packaging_cost: existingCost.packaging_cost,
        shipping_cost: existingCost.shipping_cost,
        warehousing_cost: existingCost.warehousing_cost,
        duties_customs_cost: existingCost.duties_customs_cost,
        pick_pack_cost: existingCost.pick_pack_cost,
        storage_cost: existingCost.storage_cost,
        outbound_shipping_cost: existingCost.outbound_shipping_cost,
        labor_cost: existingCost.labor_cost,
        assembly_cost: existingCost.assembly_cost,
        export_cost: existingCost.export_cost,
        quality_control_cost: existingCost.quality_control_cost,
        compliance_cost: existingCost.compliance_cost,
        other_cost_1: existingCost.other_cost_1,
        other_cost_1_description: existingCost.other_cost_1_description || "",
        other_cost_2: existingCost.other_cost_2,
        other_cost_2_description: existingCost.other_cost_2_description || "",
        target_margin_percent: existingCost.target_margin_percent,
        notes: existingCost.notes || "",
      });
      setEditingId(existingCost.id);
    } else {
      setEditData({
        sku_id: skuId,
        unit_cost: 0,
        packaging_cost: 0,
        shipping_cost: 0,
        warehousing_cost: 0,
        duties_customs_cost: 0,
        pick_pack_cost: 0,
        storage_cost: 0,
        outbound_shipping_cost: 0,
        labor_cost: 0,
        assembly_cost: 0,
        export_cost: 0,
        quality_control_cost: 0,
        compliance_cost: 0,
        other_cost_1: 0,
        other_cost_1_description: "",
        other_cost_2: 0,
        other_cost_2_description: "",
        target_margin_percent: 0,
        notes: "",
      });
      setEditingId("new-" + skuId);
    }
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const skuId = editingId.startsWith("new-") ? editingId.replace("new-", "") : editData.sku_id;
      
      // Update PO number if it has changed
      const currentSKU = businessData.skuList?.find(s => s.id === skuId);
      if (currentSKU && editingPONumber !== (currentSKU.current_po_number || "")) {
        await updateSKU.mutateAsync({
          id: skuId,
          input: { current_po_number: editingPONumber.trim() || null }
        });
      }

      // Update cost details
      if (editingId.startsWith("new-")) {
        await createCostDetail.mutateAsync(editData);
      } else {
        await updateCostDetail.mutateAsync({
          id: editingId,
          input: editData,
        });
      }
      
      setEditingId(null);
      setEditingPONumber("");
    } catch (error) {
      console.error("Failed to save cost details:", error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingPONumber("");
  };

  const updateEditData = (field: keyof SKUCostInput, value: number | string) => {
    let processedValue: number | string = value;
    
    // Handle numeric fields with exact precision
    if (typeof value === 'string' && value !== '') {
      processedValue = parseFloat(value);
      // Only update if it's a valid number, otherwise keep the string for user editing
      if (isNaN(processedValue)) {
        processedValue = value; // Keep the string for continued editing
      }
    } else if (value === '') {
      processedValue = 0;
    }
    
    const updatedData = { ...editData, [field]: processedValue };
    setEditData(updatedData);
  };

  const getMarginBadgeVariant = (marginPercent: number) => {
    if (marginPercent >= 30) return "default";
    if (marginPercent >= 15) return "secondary";
    return "destructive";
  };

  if (businessData.isLoading) {
    return <div>Loading SKU data...</div>;
  }

  // Show empty state if no SKUs exist
  if (!businessData.skuList || businessData.skuList.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>SKU Cost Management</CardTitle>
                <CardDescription>
                  Configure detailed cost breakdowns for each SKU to calculate accurate margins and landed costs.
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add SKU
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">No SKUs found</p>
                <p className="text-sm">Get started by adding your first SKU to begin tracking unit economics.</p>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First SKU
              </Button>
            </div>
          </CardContent>
        </Card>
        <AddSKUDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SKU Cost Management</CardTitle>
              <CardDescription>
                Configure detailed cost breakdowns for each SKU to calculate accurate margins and landed costs.
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add SKU
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>PO#</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Packaging</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead>Warehousing</TableHead>
                  <TableHead>Duties/Customs</TableHead>
                  <TableHead>Pick/Pack</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>Outbound Ship</TableHead>
                  <TableHead>Labor</TableHead>
                  <TableHead>Assembly</TableHead>
                  <TableHead>Export</TableHead>
                  <TableHead>Quality Control</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Other Cost 1</TableHead>
                  <TableHead>Other Cost 2</TableHead>
                  <TableHead>Total Landed</TableHead>
                  <TableHead>Gross Margin</TableHead>
                  <TableHead>Target Margin %</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessData.skuList?.map((sku) => {
                  const costDetail = costDetailsMap.get(sku.id);
                  const economics = analytics.skuEconomics.find(e => e.sku_id === sku.id);
                  const isEditing = editingId === costDetail?.id || editingId === "new-" + sku.id;

                  return (
                    <TableRow key={sku.id}>
                      <TableCell className="font-medium">{sku.sku}</TableCell>
                      <TableCell>{sku.name}</TableCell>
                      <TableCell>{sku.category}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="text"
                            value={editingPONumber}
                            onChange={(e) => setEditingPONumber(e.target.value)}
                            placeholder="Enter PO#"
                            className="w-24"
                          />
                        ) : (
                          <span className="text-muted-foreground">
                            {sku.current_po_number || "N/A"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatExactCurrency(sku.price || 0)}</TableCell>
                      
                      {/* Cost breakdown columns */}
                      {["unit_cost", "packaging_cost", "shipping_cost", "warehousing_cost", 
                        "duties_customs_cost", "pick_pack_cost", "storage_cost", "outbound_shipping_cost",
                        "labor_cost", "assembly_cost", "export_cost", "quality_control_cost", 
                        "compliance_cost", "other_cost_1", "other_cost_2"].map((field) => (
                        <TableCell key={field}>
                          {isEditing ? (
                            <Input
                              type="number"
                              step="any"
                              value={editData[field as keyof SKUCostInput] as number}
                              onChange={(e) => updateEditData(field as keyof SKUCostInput, e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-20"
                            />
                           ) : (
                             formatExactCurrency(costDetail?.[field as keyof typeof costDetail] as number || 0)
                           )}
                        </TableCell>
                      ))}
                      
                       <TableCell className="font-semibold">
                         {formatExactCurrency(economics?.total_landed_cost || 0)}
                       </TableCell>
                      
                      <TableCell>
                        {economics && (
                           <Badge variant={getMarginBadgeVariant(economics.gross_margin_percent)}>
                             {economics.gross_margin_percent.toFixed(2)}%
                           </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {isEditing ? (
                           <Input
                            type="number"
                            step="any"
                            value={editData.target_margin_percent}
                            onChange={(e) => updateEditData("target_margin_percent", e.target.value === '' ? 0 : parseFloat(e.target.value))}
                            className="w-20"
                          />
                         ) : (
                           `${formatExactNumber(costDetail?.target_margin_percent || 0)}%`
                         )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button size="sm" onClick={handleSave}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancel}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleEdit(sku.id)}>
                              {costDetail ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {editingId && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Custom Cost Descriptions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Other Cost 1 Description</label>
                    <Input
                      placeholder="e.g., Marketing allocation, R&D costs..."
                      value={editData.other_cost_1_description}
                      onChange={(e) => updateEditData("other_cost_1_description", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Other Cost 2 Description</label>
                    <Input
                      placeholder="e.g., Insurance, Licensing fees..."
                      value={editData.other_cost_2_description}
                      onChange={(e) => updateEditData("other_cost_2_description", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <Textarea
                  placeholder="Add notes about this SKU's cost structure..."
                  value={editData.notes}
                  onChange={(e) => updateEditData("notes", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddSKUDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
};