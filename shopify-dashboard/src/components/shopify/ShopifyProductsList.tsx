import React, { useState } from "react";
import {
  useShopifyProducts,
  useShopifyProductCount,
  useCreateShopifyProduct,
  useUpdateShopifyProduct,
  useDeleteShopifyProduct,
} from "@/hooks/useShopifyProducts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Sample Shopify Products List Component
 * Demonstrates how to use Shopify React Query hooks
 */
export function ShopifyProductsList() {
  const { toast } = useToast();
  const [limit, setLimit] = useState(10);

  // Fetch products
  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
  } = useShopifyProducts({ limit, status: "active" });

  // Fetch product count
  const { data: productCount } = useShopifyProductCount({ status: "active" });

  // Mutations
  const createProduct = useCreateShopifyProduct();
  const updateProduct = useUpdateShopifyProduct();
  const deleteProduct = useDeleteShopifyProduct();

  // Handlers
  const handleCreateProduct = async () => {
    try {
      await createProduct.mutateAsync({
        title: "New Product",
        body_html: "<p>Product description</p>",
        vendor: "Your Store",
        product_type: "Sample",
        status: "draft",
        variants: [
          {
            price: "29.99",
            sku: "SKU-001",
            inventory_quantity: 100,
          },
        ],
      });

      toast({
        title: "Success",
        description: "Product created successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create product",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async (productId: number) => {
    try {
      await updateProduct.mutateAsync({
        productId,
        payload: {
          title: "Updated Product Title",
        },
      });

      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct.mutateAsync(productId);

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

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
          <CardTitle>Error Loading Products</CardTitle>
          <CardDescription className="text-destructive">
            {error instanceof Error ? error.message : "An error occurred"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shopify Products</CardTitle>
              <CardDescription>
                Total Products: {productCount || 0}
              </CardDescription>
            </div>
            <Button
              onClick={handleCreateProduct}
              disabled={createProduct.isLoading}
            >
              {createProduct.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products?.map((product) => (
              <Card key={product.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          {product.title}
                        </h3>
                        <Badge
                          variant={
                            product.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {product.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Vendor: {product.vendor} | Type: {product.product_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Variants: {product.variants?.length || 0}
                      </p>
                      {product.variants?.[0] && (
                        <p className="text-sm font-medium mt-1">
                          Price: ${product.variants[0].price}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateProduct(product.id)}
                        disabled={updateProduct.isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deleteProduct.isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!products || products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products found
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
