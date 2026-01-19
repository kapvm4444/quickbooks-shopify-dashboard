import { useQuickBooksRevenue } from "./useQuickBooksRevenue";
import { useShopifyOrders } from "./useShopifyOrders";
import { useMemo } from "react";

export function useCombinedRevenue() {
    const {
        data: qbRevenue = [],
        isLoading: isQbLoading,
        refetch: refetchQb
    } = useQuickBooksRevenue();

    const {
        data: shopifyOrders = [],
        isLoading: isShopifyLoading,
        refetch: refetchShopify
    } = useShopifyOrders({ limit: 250, status: 'any' });

    const combinedRevenue = useMemo(() => {
        // Transform Shopify orders to match Revenue Record shape
        const shopifyRevenue = shopifyOrders.map(order => ({
            id: `shopify-${order.id}`,
            transaction_date: order.created_at,
            description: `Shopify Order #${order.order_number}`,
            // Use total_price (string) convert to number
            amount: parseFloat(order.total_price),
            category: "Shopify Sales",
            chart_account_name: "Shopify Sales",
            chart_account_code: "4001" // Arbitrary code for Shopify
        }));

        return [...qbRevenue, ...shopifyRevenue].sort((a, b) =>
            new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
        );
    }, [qbRevenue, shopifyOrders]);

    const isLoading = isQbLoading || isShopifyLoading;

    const refetch = () => {
        refetchQb();
        refetchShopify();
    };

    return {
        revenueRecords: combinedRevenue,
        isLoading,
        refetch
    };
}
