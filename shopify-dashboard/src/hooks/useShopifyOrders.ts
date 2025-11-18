import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { shopifyClient } from "@/integrations/shopify/client";
import { DATA_REFRESH_INTERVALS } from "@/lib/constants";
import type {
  ShopifyOrder,
  CreateOrderPayload,
  OrderQueryParams,
} from "@/integrations/shopify/types";

// Query Keys
export const shopifyOrderKeys = {
  all: ["shopify", "orders"] as const,
  lists: () => [...shopifyOrderKeys.all, "list"] as const,
  list: (params?: OrderQueryParams) =>
    [...shopifyOrderKeys.lists(), params] as const,
  details: () => [...shopifyOrderKeys.all, "detail"] as const,
  detail: (id: number | string) => [...shopifyOrderKeys.details(), id] as const,
  count: (params?: Omit<OrderQueryParams, "limit" | "page_info">) =>
    [...shopifyOrderKeys.all, "count", params] as const,
};

// Fetch Orders List
export function useShopifyOrders(
  params?: OrderQueryParams,
  options?: Omit<
    UseQueryOptions<ShopifyOrder[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<ShopifyOrder[], Error>({
    queryKey: shopifyOrderKeys.list(params),
    queryFn: async () => {
      const response = await shopifyClient.getOrders(params);
      return response.orders;
    },
    staleTime: DATA_REFRESH_INTERVALS.SHOPIFY,
    ...options,
  });
}

// Fetch Single Order
export function useShopifyOrder(
  orderId?: number | string,
  options?: Omit<UseQueryOptions<ShopifyOrder, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<ShopifyOrder, Error>({
    queryKey: shopifyOrderKeys.detail(orderId!),
    queryFn: async () => {
      const response = await shopifyClient.getOrder(orderId!);
      return response.order;
    },
    enabled: !!orderId,
    staleTime: DATA_REFRESH_INTERVALS.SHOPIFY,
    ...options,
  });
}

// Fetch Order Count
export function useShopifyOrderCount(
  params?: Omit<OrderQueryParams, "limit" | "page_info">,
  options?: Omit<UseQueryOptions<number, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<number, Error>({
    queryKey: shopifyOrderKeys.count(params),
    queryFn: async () => {
      const response = await shopifyClient.getOrderCount(params);
      return response.count;
    },
    staleTime: DATA_REFRESH_INTERVALS.SHOPIFY,
    ...options,
  });
}

// Create Order
export function useCreateShopifyOrder() {
  const queryClient = useQueryClient();

  return useMutation<ShopifyOrder, Error, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const response = await shopifyClient.createOrder(payload);
      return response.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shopifyOrderKeys.all });
    },
  });
}

// Update Order
export function useUpdateShopifyOrder() {
  const queryClient = useQueryClient();

  return useMutation<
    ShopifyOrder,
    Error,
    { orderId: number | string; payload: Partial<CreateOrderPayload> }
  >({
    mutationFn: async ({ orderId, payload }) => {
      const response = await shopifyClient.updateOrder(orderId, payload);
      return response.order;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        shopifyOrderKeys.detail(variables.orderId),
        data,
      );
      queryClient.invalidateQueries({ queryKey: shopifyOrderKeys.lists() });
    },
  });
}

// Cancel Order
export function useCancelShopifyOrder() {
  const queryClient = useQueryClient();

  return useMutation<
    ShopifyOrder,
    Error,
    { orderId: number | string; reason?: string }
  >({
    mutationFn: async ({ orderId, reason }) => {
      const response = await shopifyClient.cancelOrder(orderId, reason);
      return response.order;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        shopifyOrderKeys.detail(variables.orderId),
        data,
      );
      queryClient.invalidateQueries({ queryKey: shopifyOrderKeys.lists() });
    },
  });
}

// Close Order
export function useCloseShopifyOrder() {
  const queryClient = useQueryClient();

  return useMutation<ShopifyOrder, Error, number | string>({
    mutationFn: async (orderId) => {
      const response = await shopifyClient.closeOrder(orderId);
      return response.order;
    },
    onSuccess: (data, orderId) => {
      queryClient.setQueryData(shopifyOrderKeys.detail(orderId), data);
      queryClient.invalidateQueries({ queryKey: shopifyOrderKeys.lists() });
    },
  });
}
