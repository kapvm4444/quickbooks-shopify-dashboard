import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface VendorMetrics {
  vendorId: string;
  totalSpend: number;
  orderCount: number;
  averageOrderValue: number;
  onTimeDeliveryRate: number;
  lastOrderDate: string | null;
  monthlyTrend: number;
}

export interface VendorPurchaseOrder {
  id: string;
  vendor_id: string | null;
  vendor_name: string;
  total_amount: number;
  order_date: string;
  delivery_date: string | null;
  status: string;
  created_at: string;
}

export const useVendorMetrics = () => {
  const { data: purchaseOrders, isLoading } = useQuery({
    queryKey: ['purchase_orders_for_metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*');
      
      if (error) throw error;
      return data as VendorPurchaseOrder[];
    },
  });

  const vendorMetrics = useMemo(() => {
    if (!purchaseOrders) return [];

    const metricsMap = new Map<string, VendorMetrics>();
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    purchaseOrders.forEach(po => {
      const vendorId = po.vendor_id || po.vendor_name; // Fallback for legacy data
      if (!vendorId) return;

      const existing = metricsMap.get(vendorId) || {
        vendorId,
        totalSpend: 0,
        orderCount: 0,
        averageOrderValue: 0,
        onTimeDeliveryRate: 0,
        lastOrderDate: null,
        monthlyTrend: 0,
      };

      existing.totalSpend += po.total_amount;
      existing.orderCount += 1;
      
      const orderDate = new Date(po.order_date);
      if (!existing.lastOrderDate || orderDate > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = po.order_date;
      }

      metricsMap.set(vendorId, existing);
    });

    // Calculate derived metrics
    metricsMap.forEach((metrics, vendorId) => {
      metrics.averageOrderValue = metrics.totalSpend / metrics.orderCount;
      
      // Calculate on-time delivery rate
      const vendorOrders = purchaseOrders.filter(po => 
        (po.vendor_id || po.vendor_name) === vendorId && 
        po.delivery_date && 
        po.status === 'Delivered'
      );
      
      if (vendorOrders.length > 0) {
        const onTimeOrders = vendorOrders.filter(po => {
          const deliveryDate = new Date(po.delivery_date!);
          const expectedDate = new Date(po.order_date);
          expectedDate.setDate(expectedDate.getDate() + 30); // Assume 30 day default
          return deliveryDate <= expectedDate;
        });
        metrics.onTimeDeliveryRate = (onTimeOrders.length / vendorOrders.length) * 100;
      }

      // Calculate monthly trend
      const thisMonthOrders = purchaseOrders.filter(po => 
        (po.vendor_id || po.vendor_name) === vendorId && 
        new Date(po.order_date) >= thisMonth
      );
      const lastMonthOrders = purchaseOrders.filter(po => 
        (po.vendor_id || po.vendor_name) === vendorId && 
        new Date(po.order_date) >= lastMonth && 
        new Date(po.order_date) < thisMonth
      );

      const thisMonthSpend = thisMonthOrders.reduce((sum, po) => sum + po.total_amount, 0);
      const lastMonthSpend = lastMonthOrders.reduce((sum, po) => sum + po.total_amount, 0);
      
      if (lastMonthSpend > 0) {
        metrics.monthlyTrend = ((thisMonthSpend - lastMonthSpend) / lastMonthSpend) * 100;
      }
    });

    return Array.from(metricsMap.values());
  }, [purchaseOrders]);

  return {
    vendorMetrics,
    isLoading,
  };
};

export const useVendorPurchaseHistory = (vendorId: string) => {
  const { data: purchaseOrders, isLoading } = useQuery({
    queryKey: ['vendor_purchase_history', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('vendor_id', vendorId);
      
      if (error) throw error;
      return data as VendorPurchaseOrder[];
    },
    enabled: !!vendorId,
  });

  const metrics = useMemo(() => {
    if (!purchaseOrders || purchaseOrders.length === 0) {
      return {
        totalSpend: 0,
        orderCount: 0,
        averageOrderValue: 0,
        onTimeDeliveryRate: 0,
        lastOrderDate: null,
      };
    }

    const totalSpend = purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0);
    const orderCount = purchaseOrders.length;
    const averageOrderValue = totalSpend / orderCount;
    
    const deliveredOrders = purchaseOrders.filter(po => 
      po.delivery_date && po.status === 'Delivered'
    );
    
    const onTimeOrders = deliveredOrders.filter(po => {
      const deliveryDate = new Date(po.delivery_date!);
      const expectedDate = new Date(po.order_date);
      expectedDate.setDate(expectedDate.getDate() + 30);
      return deliveryDate <= expectedDate;
    });
    
    const onTimeDeliveryRate = deliveredOrders.length > 0 
      ? (onTimeOrders.length / deliveredOrders.length) * 100 
      : 0;
    
    const lastOrderDate = purchaseOrders
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())[0]?.order_date || null;

    return {
      totalSpend,
      orderCount,
      averageOrderValue,
      onTimeDeliveryRate,
      lastOrderDate,
    };
  }, [purchaseOrders]);

  return {
    purchaseOrders: purchaseOrders || [],
    metrics,
    isLoading,
  };
};