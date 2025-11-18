import { FinancialRecord } from '@/types/business';

export interface TransformedSKU {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  margin: number;
  stock: number;
  sold: number;
  revenue: number;
  status: string;
  quantity: number;
  totalValue: number;
  current_po_number?: string;
}

export function transformSKUData(skuRecords: FinancialRecord[]): TransformedSKU[] {
  return skuRecords.map(record => {
    const metadata = record.metadata || {};
    const originalRow = metadata.original_row || [];
    
    // Extract data from spreadsheet columns properly
    // originalRow format: [SKU#, Description, Category, Sale Price, Cost, Quantity, Status]
    const skuNumber = record.description || `SKU-${record.id.slice(0, 8)}`;
    const productName = originalRow[1] || metadata.product_name || 'Unknown Product';
    
    // Fix category mapping - ensure we're getting the actual category, not price data
    let category = originalRow[2] || 'Products';
    
    // If category looks like a number (price), try to find the actual category elsewhere
    if (!isNaN(parseFloat(category)) && isFinite(category)) {
      console.warn('Category appears to be numeric, checking other positions:', category);
      // Try to derive category from SKU prefix or use a default
      const skuPrefix = skuNumber.split('-')[0];
      if (skuPrefix.toLowerCase().includes('elec')) category = 'Electronics';
      else if (skuPrefix.toLowerCase().includes('cloth')) category = 'Clothing';
      else if (skuPrefix.toLowerCase().includes('food')) category = 'Food & Beverage'; 
      else category = 'Products'; // Default fallback
    }
    
    // Clean category string and ensure it's not empty
    category = String(category).trim() || 'Products';
    
    // Get the correct values from either the updated data or original spreadsheet
    const salePrice = Number(record.amount) || Number(originalRow[3]) || 0;
    const costPrice = Number(originalRow[4]) || Number(metadata.cost_price) || (salePrice * 0.6);
    const quantity = Number(originalRow[5]) || Number(metadata.quantity) || 0;
    const status = originalRow[6] || metadata.status || 'Active';
    
    // Handle samples differently - no margin calculation
    const isSample = category === 'Samples';
    const margin = !isSample && salePrice > 0 && costPrice >= 0 ? 
      Math.round(((salePrice - costPrice) / salePrice) * 100) : 0;
    
    // Determine category based on SKU prefix if not provided
    let finalCategory = category;
    if (!category || category === 'Products') {
      if (skuNumber.includes('KNF')) finalCategory = 'Knives';
      if (skuNumber.includes('SUB')) finalCategory = 'Subscriptions';
      if (skuNumber.includes('MRG')) finalCategory = 'Merch';
      if (skuNumber.includes('SMPL')) finalCategory = 'Samples';
      if (productName.toLowerCase().includes('subscription')) finalCategory = 'Subscriptions';
      if (productName.toLowerCase().includes('sample')) finalCategory = 'Samples';
    }

    // For samples, calculate total value as batch cost (since no sale price)
    const totalValue = isSample ? costPrice : salePrice * quantity;

    return {
      id: record.id,
      sku: skuNumber,
      name: productName,
      category: finalCategory,
      price: salePrice,
      cost: costPrice,
      margin,
      stock: quantity,
      sold: 0, // This would come from order data
      revenue: 0, // This would be calculated from sold * price
      status,
      quantity,
      totalValue,
      current_po_number: metadata.current_po_number || undefined
    };
  });
}

export function calculateSKUMetrics(skus: TransformedSKU[]) {
  return {
    totalSKUs: skus.length,
    totalValue: skus.reduce((sum, sku) => sum + sku.totalValue, 0),
    totalUnits: skus.reduce((sum, sku) => sum + sku.quantity, 0),
    averageMargin: skus.length ? skus.reduce((sum, sku) => sum + sku.margin, 0) / skus.length : 0,
    activeCount: skus.filter(sku => sku.status === 'Active').length,
    categoryBreakdown: skus.reduce((acc, sku) => {
      const category = sku.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0, quantity: 0 };
      }
      acc[category].count++;
      acc[category].value += sku.totalValue;
      acc[category].quantity += sku.quantity;
      return acc;
    }, {} as Record<string, { count: number; value: number; quantity: number }>)
  };
}