import { useMemo } from "react";
import { useSKUCostDetails } from "./useSKUCostDetails";
import { useBusinessData } from "./business/useBusinessData";

export interface SKUEconomics {
  sku_id: string;
  sku: string;
  name: string;
  category: string;
  selling_price: number;
  total_landed_cost: number;
  gross_margin: number;
  gross_margin_percent: number;
  target_margin_percent: number;
  margin_variance: number;
  current_po_number?: string;
  cost_breakdown: {
    unit_cost: number;
    packaging_cost: number;
    shipping_cost: number;
    warehousing_cost: number;
    duties_customs_cost: number;
    pick_pack_cost: number;
    storage_cost: number;
    outbound_shipping_cost: number;
    labor_cost: number;
    assembly_cost: number;
    export_cost: number;
    quality_control_cost: number;
    compliance_cost: number;
    other_cost_1: number;
    other_cost_2: number;
  };
  notes?: string;
}

export interface UnitEconomicsAnalytics {
  skuEconomics: SKUEconomics[];
  avgGrossMargin: number;
  totalSKUs: number;
  profitableSKUs: number;
  unprofitableSKUs: number;
  highestMarginSKU?: SKUEconomics;
  lowestMarginSKU?: SKUEconomics;
  categoryBreakdown: Array<{
    category: string;
    avgMargin: number;
    skuCount: number;
    totalRevenue: number;
  }>;
  costComponentAnalysis: Array<{
    component: string;
    avgCost: number;
    percentageOfTotal: number;
  }>;
}

export const useUnitEconomicsCalculations = () => {
  const { data: costDetails, isLoading: costLoading } = useSKUCostDetails();
  const businessData = useBusinessData();
  const isBusinessLoading = businessData.isLoading;

  const analytics = useMemo((): UnitEconomicsAnalytics => {
    if (!costDetails || !businessData.skuList) {
      return {
        skuEconomics: [],
        avgGrossMargin: 0,
        totalSKUs: 0,
        profitableSKUs: 0,
        unprofitableSKUs: 0,
        categoryBreakdown: [],
        costComponentAnalysis: [],
      };
    }

    // Create a map of cost details by SKU ID
    const costDetailsMap = new Map(costDetails.map(cd => [cd.sku_id, cd]));

    // Calculate economics for each SKU
    const skuEconomics: SKUEconomics[] = businessData.skuList.map(sku => {
      const costDetail = costDetailsMap.get(sku.id);
      const sellingPrice = sku.price || 0;
      const totalLandedCost = costDetail?.total_landed_cost || 0;
      const grossMargin = sellingPrice - totalLandedCost;
      const grossMarginPercent = sellingPrice > 0 ? (grossMargin / sellingPrice) * 100 : 0;
      const targetMarginPercent = costDetail?.target_margin_percent || 0;
      const marginVariance = grossMarginPercent - targetMarginPercent;

      return {
        sku_id: sku.id,
        sku: sku.sku,
        name: sku.name,
        category: sku.category,
        selling_price: sellingPrice,
        total_landed_cost: totalLandedCost,
        gross_margin: grossMargin,
        gross_margin_percent: grossMarginPercent,
        target_margin_percent: targetMarginPercent,
        margin_variance: marginVariance,
        current_po_number: sku.current_po_number,
        cost_breakdown: {
          unit_cost: costDetail?.unit_cost || 0,
          packaging_cost: costDetail?.packaging_cost || 0,
          shipping_cost: costDetail?.shipping_cost || 0,
          warehousing_cost: costDetail?.warehousing_cost || 0,
          duties_customs_cost: costDetail?.duties_customs_cost || 0,
          pick_pack_cost: costDetail?.pick_pack_cost || 0,
          storage_cost: costDetail?.storage_cost || 0,
          outbound_shipping_cost: costDetail?.outbound_shipping_cost || 0,
          labor_cost: costDetail?.labor_cost || 0,
          assembly_cost: costDetail?.assembly_cost || 0,
          export_cost: costDetail?.export_cost || 0,
          quality_control_cost: costDetail?.quality_control_cost || 0,
          compliance_cost: costDetail?.compliance_cost || 0,
          other_cost_1: costDetail?.other_cost_1 || 0,
          other_cost_2: costDetail?.other_cost_2 || 0,
        },
        notes: costDetail?.notes,
      };
    });

    // Calculate overall metrics
    const avgGrossMargin = skuEconomics.length > 0 
      ? skuEconomics.reduce((sum, sku) => sum + sku.gross_margin_percent, 0) / skuEconomics.length 
      : 0;

    const profitableSKUs = skuEconomics.filter(sku => sku.gross_margin > 0).length;
    const unprofitableSKUs = skuEconomics.filter(sku => sku.gross_margin <= 0).length;

    const highestMarginSKU = skuEconomics.reduce((max, sku) => 
      sku.gross_margin_percent > (max?.gross_margin_percent || -Infinity) ? sku : max, 
      undefined as SKUEconomics | undefined
    );

    const lowestMarginSKU = skuEconomics.reduce((min, sku) => 
      sku.gross_margin_percent < (min?.gross_margin_percent || Infinity) ? sku : min, 
      undefined as SKUEconomics | undefined
    );

    // Category breakdown
    const categoryMap = new Map<string, { totalMargin: number; count: number; totalRevenue: number }>();
    skuEconomics.forEach(sku => {
      const category = sku.category || 'Uncategorized';
      const current = categoryMap.get(category) || { totalMargin: 0, count: 0, totalRevenue: 0 };
      const skuQuantity = businessData.skuList?.find(s => s.id === sku.sku_id)?.quantity || 0;
      categoryMap.set(category, {
        totalMargin: current.totalMargin + sku.gross_margin_percent,
        count: current.count + 1,
        totalRevenue: current.totalRevenue + (sku.selling_price * skuQuantity),
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      avgMargin: data.count > 0 ? data.totalMargin / data.count : 0,
      skuCount: data.count,
      totalRevenue: data.totalRevenue,
    }));

    // Cost component analysis
    const costComponents = [
      'unit_cost', 'packaging_cost', 'shipping_cost', 'warehousing_cost',
      'duties_customs_cost', 'pick_pack_cost', 'storage_cost', 'outbound_shipping_cost',
      'labor_cost', 'assembly_cost', 'export_cost', 'quality_control_cost', 
      'compliance_cost', 'other_cost_1', 'other_cost_2'
    ];

    const totalCosts = skuEconomics.reduce((sum, sku) => sum + sku.total_landed_cost, 0);
    
    const costComponentAnalysis = costComponents.map(component => {
      const totalComponentCost = skuEconomics.reduce((sum, sku) => 
        sum + (sku.cost_breakdown[component as keyof typeof sku.cost_breakdown] || 0), 0
      );
      
      return {
        component: component.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        avgCost: skuEconomics.length > 0 ? totalComponentCost / skuEconomics.length : 0,
        percentageOfTotal: totalCosts > 0 ? (totalComponentCost / totalCosts) * 100 : 0,
      };
    });

    return {
      skuEconomics,
      avgGrossMargin,
      totalSKUs: skuEconomics.length,
      profitableSKUs,
      unprofitableSKUs,
      highestMarginSKU,
      lowestMarginSKU,
      categoryBreakdown,
      costComponentAnalysis,
    };
  }, [costDetails, businessData.skuList]);

  return {
    analytics,
    isLoading: costLoading || isBusinessLoading,
  };
};