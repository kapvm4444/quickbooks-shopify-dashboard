/**
 * Shared Inventory Data Context
 * Centralizes inventory-related queries to improve performance
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { ShopifyOrder } from '@/types/business';
import { useOptimizedSKURecords } from './FinancialDataContext';
import { transformSKUData } from '@/utils/calculations/skuTransformations';
import { combineLoadingStates } from '@/lib/loading';

interface DatabaseSKU {
  id: string;
  user_id: string;
  sku: string;
  name: string;
  category?: string;
  price: number;
  cost: number;
  margin?: number;
  quantity: number;
  stock?: number;
  status: string;
  current_po_number?: string;
  created_at: string;
  updated_at: string;
}

interface InventoryDataContextValue {
  // Raw data sources
  shopifyOrders: ShopifyOrder[];
  databaseSKUs: DatabaseSKU[];
  isLoading: boolean;
  error: any;
  
  // Processed data
  skuList: any[];
  totalSKUs: number;
  totalInventoryValue: number;
  totalUnits: number;
  inventoryByCategory: any[];
}

const InventoryDataContext = createContext<InventoryDataContextValue | undefined>(undefined);

export function InventoryDataProvider({ children }: { children: React.ReactNode }) {
  // Get Shopify orders
  const { data: shopifyOrders = [], isLoading: ordersLoading } = useSupabaseQuery<ShopifyOrder>(
    ['shopify-orders'],
    'shopify_orders',
    '*'
  );

  // Get database SKUs
  const { data: databaseSKUs = [], isLoading: skusLoading } = useSupabaseQuery<DatabaseSKU>(
    ['database-skus'],
    'skus',
    '*'
  );

  // Get SKU records from shared financial context (no additional query!)
  const { data: skuFinancialRecords = [], isLoading: financialLoading } = useOptimizedSKURecords();

  const contextValue = useMemo(() => {
    const isLoading = combineLoadingStates(ordersLoading, skusLoading, financialLoading);

    if (!shopifyOrders.length && !skuFinancialRecords.length && !databaseSKUs.length) {
      return {
        shopifyOrders,
        databaseSKUs,
        isLoading,
        error: null,
        skuList: [],
        totalSKUs: 0,
        totalInventoryValue: 0,
        totalUnits: 0,
        inventoryByCategory: []
      };
    }

    // Transform SKU data from Google Sheets (financial_records)
    const skuFromSheets = transformSKUData(skuFinancialRecords);

    // Process Shopify order data for inventory
    const inventoryData = shopifyOrders.reduce((acc, order) => {
      if (order.line_items && Array.isArray(order.line_items)) {
        order.line_items.forEach((item: any) => {
          const sku = item.sku || item.variant_id || `product-${Math.random()}`;
          if (!acc[sku]) {
            acc[sku] = {
              id: sku,
              sku,
              name: item.name || item.title || 'Unknown Product',
              category: item.product_type || 'Uncategorized',
              price: parseFloat(item.price) || 0,
              cost: parseFloat(item.price) * 0.6 || 0,
              margin: 40,
              stock: 0,
              sold: 0,
              revenue: 0,
              status: 'Active',
              quantity: 0,
              totalValue: 0
            };
          }
          acc[sku].sold += item.quantity || 1;
          acc[sku].revenue += (parseFloat(item.price) || 0) * (item.quantity || 1);
        });
      }
      return acc;
    }, {} as Record<string, any>);

    const skuFromShopify = Object.values(inventoryData);

    // Transform database SKUs to match format
    const skuFromDatabase = databaseSKUs.map(sku => ({
      id: sku.id,
      sku: sku.sku,
      name: sku.name,
      category: sku.category || 'Uncategorized',
      price: sku.price || 0,
      cost: sku.cost || 0,
      margin: sku.margin || 0,
      stock: sku.stock || 0,
      sold: 0,
      revenue: 0,
      status: sku.status || 'active',
      quantity: sku.quantity || 0,
      totalValue: (sku.price || 0) * (sku.quantity || 0),
      current_po_number: sku.current_po_number
    }));

    // Combine all sources, prioritizing database > Google Sheets > Shopify
    const combinedSKUs = [...skuFromDatabase];
    
    // Add Google Sheets SKUs that aren't in database
    skuFromSheets.forEach(sheetsSku => {
      const existsInDatabase = skuFromDatabase.some(dbSku => 
        dbSku.sku === sheetsSku.sku || dbSku.name === sheetsSku.name
      );
      if (!existsInDatabase) {
        combinedSKUs.push({
          ...sheetsSku,
          current_po_number: undefined
        });
      }
    });
    
    // Add Shopify SKUs that aren't already covered
    skuFromShopify.forEach(shopifySku => {
      const existsAlready = combinedSKUs.some(existingSku => 
        existingSku.sku === shopifySku.sku || existingSku.name === shopifySku.name
      );
      if (!existsAlready) {
        combinedSKUs.push({
          ...shopifySku,
          current_po_number: undefined
        });
      }
    });

    const skuList = combinedSKUs;
    const totalSKUs = skuList.length;
    const totalInventoryValue = skuList.reduce((sum: number, item: any) => sum + (item.totalValue || 0), 0);
    const totalUnits = skuList.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

    // Group by category for analytics
    const inventoryByCategory = skuList.reduce((acc, item: any) => {
      const category = item.category || 'Uncategorized';
      const existing = acc.find((cat: any) => cat.category === category);
      
      if (existing) {
        existing.quantity += item.quantity || 0;
        existing.value += item.totalValue || 0;
        existing.items += 1;
      } else {
        acc.push({
          category,
          quantity: item.quantity || 0,
          value: item.totalValue || 0,
          items: 1
        });
      }
      
      return acc;
    }, [] as any[]);

    return {
      shopifyOrders,
      databaseSKUs,
      isLoading,
      error: null,
      skuList,
      totalSKUs,
      totalInventoryValue,
      totalUnits,
      inventoryByCategory
    };
  }, [shopifyOrders, databaseSKUs, skuFinancialRecords, ordersLoading, skusLoading, financialLoading]);

  return (
    <InventoryDataContext.Provider value={contextValue}>
      {children}
    </InventoryDataContext.Provider>
  );
}

/**
 * Hook to access inventory data context
 */
export function useInventoryDataContext() {
  const context = useContext(InventoryDataContext);
  if (context === undefined) {
    throw new Error('useInventoryDataContext must be used within an InventoryDataProvider');
  }
  return context;
}

/**
 * Optimized inventory data hook - now uses shared context
 */
export function useOptimizedInventoryData() {
  return useInventoryDataContext();
}