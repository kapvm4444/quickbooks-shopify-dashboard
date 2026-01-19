import { useQuickBooksExpenses } from "./useQuickBooksExpenses";
import { useShopifyOrders } from "./useShopifyOrders";
import { useMemo } from "react";

export function useCombinedExpenses() {
    const {
        data: qbExpenses = [],
        isLoading: isQbLoading,
        refetch: refetchQb
    } = useQuickBooksExpenses();

    const {
        data: shopifyOrders = [],
        isLoading: isShopifyLoading,
        refetch: refetchShopify
    } = useShopifyOrders({ limit: 250, status: 'any' });

    const combinedExpenses = useMemo(() => {
        // Transform Shopify refunds to match Expense Record shape
        const shopifyExpenses: any[] = [];

        shopifyOrders.forEach(order => {
            if (order.refunds && order.refunds.length > 0) {
                order.refunds.forEach(refund => {
                    // Calculate total refund amount from transactions
                    const refundAmount = refund.transactions?.reduce((sum, txn) =>
                        sum + (txn.kind === 'refund' && txn.status === 'success' ? parseFloat(txn.amount) : 0), 0) || 0;

                    if (refundAmount > 0) {
                        shopifyExpenses.push({
                            id: `shopify-refund-${refund.id}`,
                            transaction_date: refund.created_at,
                            description: `Refund for Order #${order.order_number}`,
                            amount: refundAmount,
                            category: "Shopify Refunds",
                            chart_account_name: "Shopify Refunds",
                            chart_account_code: "4002", // Arbitrary code for Refunds
                            vendor_name: "Shopify Customer",
                            payment_method: "Shopify Payments",
                            is_recurring: false
                        });
                    }
                });
            }
        });

        return [...qbExpenses, ...shopifyExpenses].sort((a, b) =>
            new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
        );
    }, [qbExpenses, shopifyOrders]);

    const isLoading = isQbLoading || isShopifyLoading;

    const refetch = () => {
        refetchQb();
        refetchShopify();
    };

    return {
        expenseRecords: combinedExpenses,
        isLoading,
        refetch
    };
}
