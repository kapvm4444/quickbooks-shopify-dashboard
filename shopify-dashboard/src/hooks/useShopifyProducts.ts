import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { shopifyClient } from "@/integrations/shopify/client";
import { DATA_REFRESH_INTERVALS } from "@/lib/constants";
import type {
  ShopifyProduct,
  CreateProductPayload,
  UpdateProductPayload,
  ProductQueryParams,
} from "@/integrations/shopify/types";

// Query Keys
export const shopifyProductKeys = {
  all: ["shopify", "products"] as const,
  lists: () => [...shopifyProductKeys.all, "list"] as const,
  list: (params?: ProductQueryParams) =>
    [...shopifyProductKeys.lists(), params] as const,
  details: () => [...shopifyProductKeys.all, "detail"] as const,
  detail: (id: number | string) =>
    [...shopifyProductKeys.details(), id] as const,
  count: (params?: Omit<ProductQueryParams, "limit" | "page_info">) =>
    [...shopifyProductKeys.all, "count", params] as const,
};

// Fetch Products List
export function useShopifyProducts(
  params?: ProductQueryParams,
  options?: Omit<
    UseQueryOptions<ShopifyProduct[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<ShopifyProduct[], Error>({
    queryKey: shopifyProductKeys.list(params),
    queryFn: async () => {
      const response = await shopifyClient.getProducts(params);
      return response.products;
    },
    staleTime: DATA_REFRESH_INTERVALS.SHOPIFY,
    ...options,
  });
}

// Fetch Single Product
export function useShopifyProduct(
  productId?: number | string,
  options?: Omit<
    UseQueryOptions<ShopifyProduct, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<ShopifyProduct, Error>({
    queryKey: shopifyProductKeys.detail(productId!),
    queryFn: async () => {
      const response = await shopifyClient.getProduct(productId!);
      return response.product;
    },
    enabled: !!productId,
    staleTime: DATA_REFRESH_INTERVALS.SHOPIFY,
    ...options,
  });
}

// Fetch Product Count
export function useShopifyProductCount(
  params?: Omit<ProductQueryParams, "limit" | "page_info">,
  options?: Omit<UseQueryOptions<number, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<number, Error>({
    queryKey: shopifyProductKeys.count(params),
    queryFn: async () => {
      const response = await shopifyClient.getProductCount(params);
      return response.count;
    },
    staleTime: DATA_REFRESH_INTERVALS.SHOPIFY,
    ...options,
  });
}

// Create Product
export function useCreateShopifyProduct() {
  const queryClient = useQueryClient();

  return useMutation<ShopifyProduct, Error, CreateProductPayload>({
    mutationFn: async (payload) => {
      const response = await shopifyClient.createProduct(payload);
      return response.product;
    },
    onSuccess: () => {
      // Invalidate all product lists and counts
      queryClient.invalidateQueries({ queryKey: shopifyProductKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shopifyProductKeys.all });
    },
  });
}

// Update Product
export function useUpdateShopifyProduct() {
  const queryClient = useQueryClient();

  return useMutation<
    ShopifyProduct,
    Error,
    { productId: number | string; payload: UpdateProductPayload }
  >({
    mutationFn: async ({ productId, payload }) => {
      const response = await shopifyClient.updateProduct(productId, payload);
      return response.product;
    },
    onSuccess: (data, variables) => {
      // Update specific product cache
      queryClient.setQueryData(
        shopifyProductKeys.detail(variables.productId),
        data,
      );

      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: shopifyProductKeys.lists() });
    },
  });
}

// Delete Product
export function useDeleteShopifyProduct() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number | string>({
    mutationFn: async (productId) => {
      await shopifyClient.deleteProduct(productId);
    },
    onSuccess: (_, productId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: shopifyProductKeys.detail(productId),
      });

      // Invalidate lists and counts
      queryClient.invalidateQueries({ queryKey: shopifyProductKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shopifyProductKeys.all });
    },
  });
}
