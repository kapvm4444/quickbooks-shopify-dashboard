import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ShopifyProductsList } from "@/components/shopify/ShopifyProductsList";
import { ShopifyOrdersList } from "@/components/shopify/ShopifyOrdersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store, Package, ShoppingCart, Users, MapPin, Loader2 } from "lucide-react";
import { useShopifyProductCount } from "@/hooks/useShopifyProducts";
import { useShopifyOrderCount } from "@/hooks/useShopifyOrders";
import { useShopifyCustomerCount, useShopifyLocations } from "@/hooks/useShopifyCustomers";

/**
 * Shopify Integration Dashboard
 * Main page to view and manage Shopify data
 */
export default function ShopifyDashboard() {
  const { data: productCount, isLoading: isProductCountLoading } = useShopifyProductCount();
  const { data: orderCount, isLoading: isOrderCountLoading } = useShopifyOrderCount();
  const { data: customerCount, isLoading: isCustomerCountLoading } = useShopifyCustomerCount();
  const { data: locations, isLoading: isLocationsLoading } = useShopifyLocations();

  const isLoading = isProductCountLoading || isOrderCountLoading || isCustomerCountLoading || isLocationsLoading;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Store className="h-8 w-8" />
            Shopify Integration
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your Shopify products, orders, and customers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isProductCountLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{productCount ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Active products in store
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isOrderCountLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{orderCount ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isCustomerCountLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{customerCount ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Registered customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLocationsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{locations?.length ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground">Store locations</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <ShopifyProductsList />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <ShopifyOrdersList />
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shopify Integration Status</CardTitle>
                <CardDescription>
                  Connection information and setup guide
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Setup Instructions:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Go to your Shopify Admin panel</li>
                    <li>Navigate to Settings → Apps and sales channels</li>
                    <li>Click "Develop apps" and create a new app</li>
                    <li>
                      Configure Admin API scopes (read/write permissions for
                      products, orders, customers)
                    </li>
                    <li>Install the app and copy the Admin API access token</li>
                    <li>Update your .env file with the credentials</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    Environment Variables Required:
                  </h3>
                  <div className="bg-muted p-4 rounded-md font-mono text-xs">
                    <div>VITE_SHOPIFY_STORE=your-store.myshopify.com</div>
                    <div>VITE_SHOPIFY_ACCESS_TOKEN=shpat_your_token</div>
                    <div>VITE_SHOPIFY_API_VERSION=2024-01</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Features Available:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>View and manage products (create, update, delete)</li>
                    <li>View orders and order details</li>
                    <li>Search and view customers</li>
                    <li>Check inventory levels</li>
                    <li>View store locations</li>
                    <li>Real-time data synchronization with React Query</li>
                  </ul>
                </div>

                {locations && locations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Store Locations:</h3>
                    <div className="space-y-2">
                      {locations.map((location) => (
                        <Card key={location.id}>
                          <CardContent className="pt-4">
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {location.address1}, {location.city},{" "}
                              {location.province} {location.zip}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {location.country} •{" "}
                              {location.active ? "Active" : "Inactive"}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

