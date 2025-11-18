import React from "react";
import {
  useShopifyOrders,
  useShopifyOrderCount,
} from "@/hooks/useShopifyOrders";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * Sample Shopify Orders Component
 * Demonstrates fetching and displaying Shopify orders
 */
export function ShopifyOrdersList() {
  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useShopifyOrders({
    limit: 20,
    status: "any",
  });

  const { data: orderCount } = useShopifyOrderCount();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Orders</CardTitle>
          <CardDescription className="text-destructive">
            {error instanceof Error ? error.message : "An error occurred"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      paid: "default",
      pending: "secondary",
      refunded: "destructive",
      voided: "outline",
    };
    return colors[status] || "secondary";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopify Orders</CardTitle>
        <CardDescription>Total Orders: {orderCount || 0}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">
                        Order #{order.order_number}
                      </h3>
                      <Badge variant={getStatusColor(order.financial_status)}>
                        {order.financial_status}
                      </Badge>
                      {order.fulfillment_status && (
                        <Badge variant="outline">
                          {order.fulfillment_status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Customer: {order.customer?.first_name}{" "}
                      {order.customer?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Email: {order.email}
                    </p>
                    <p className="text-sm font-medium">
                      Total: {order.currency} ${order.total_price}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created{" "}
                      {formatDistanceToNow(new Date(order.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {order.line_items.length} items
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!orders || orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
