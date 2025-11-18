import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { shopifyClient } from "@/integrations/shopify/client";
import { DATA_REFRESH_INTERVALS } from "@/lib/constants";
import type {
  ShopifyLocation,
  ShopifyCustomer,
} from "@/integrations/shopify/types";

// Query Keys
export const shopifyLocationKeys = {
  all: ["shopify", "locations"] as const,
  lists: () => [...shopifyLocationKeys.all, "list"] as const,
  details: () => [...shopifyLocationKeys.all, "detail"] as const,
  detail: (id: number | string) =>
    [...shopifyLocationKeys.details(), id] as const,
};

export const shopifyCustomerKeys = {
  all: ["shopify", "customers"] as const,
  lists: () => [...shopifyCustomerKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...shopifyCustomerKeys.lists(), params] as const,
  details: () => [...shopifyCustomerKeys.all, "detail"] as const,
  detail: (id: number | string) =>
    [...shopifyCustomerKeys.details(), id] as const,
  search: (query: string) =>
    [...shopifyCustomerKeys.all, "search", query] as const,
  count: () => [...shopifyCustomerKeys.all, "count"] as const,
};

// Fetch Locations
export function useShopifyLocations(
  options?: Omit<
    UseQueryOptions<ShopifyLocation[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<ShopifyLocation[], Error>({
    queryKey: shopifyLocationKeys.lists(),
    queryFn: async () => {
      const response = await shopifyClient.getLocations();
      return response.locations;
    },
    staleTime: DATA_REFRESH_INTERVALS.SHOPIFY,
    ...options,
  });
}

// Fetch Single Location
export function useShopifyLocation(
  locationId?: number | string,
  options?: Omit<
    UseQueryOptions<ShopifyLocation, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<ShopifyLocation, Error>({
    queryKey: shopifyLocationKeys.detail(locationId!),
    queryFn: async () => {
      const response = await shopifyClient.getLocation(locationId!);
      return response.location;
    },
    enabled: !!locationId,
    staleTime: DATA_REFRESH_INTERVALS.SHOPIFY,
    ...options,
  });
}

// Fetch Customers
export function useShopifyCustomers(
  params?: {
    limit?: number;
    since_id?: number;
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
  },
  options?: Omit<
    UseQueryOptions<ShopifyCustomer[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<ShopifyCustomer[], Error>({
    queryKey: shopifyCustomerKeys.list(params),
    queryFn: async () => {
      const response = await shopifyClient.getCustomers(params);
      return response.customers;
    },
    staleTime: DATA_REFRESH_INTERVALS.SHOPIFY,
    ...options,
  });
}

// Fetch Single Customer
export function useShopifyCustomer(
  customerId?: number | string,
  options?: Omit<
    UseQueryOptions<ShopifyCustomer, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<ShopifyCustomer, Error>({
    queryKey: shopifyCustomerKeys.detail(customerId!),
    queryFn: async () => {
      const response = await shopifyClient.getCustomer(customerId!);
      return response.customer;
    },
    enabled: !!customerId,
    staleTime: DATA_REFRESH_INTERVALS.SHOPIFY,
    ...options,
  });
}

// Search Customers
export function useSearchShopifyCustomers(
  query?: string,
  options?: Omit<
    UseQueryOptions<ShopifyCustomer[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<ShopifyCustomer[], Error>({
    queryKey: shopifyCustomerKeys.search(query!),
    queryFn: async () => {
      const response = await shopifyClient.searchCustomers(query!);
      return response.customers;
    },
    enabled: !!query && query.length > 0,
    staleTime: DATA_REFRESH_INTERVALS.SHOPIFY,
    ...options,
  });
}

// Fetch Customer Count
export function useShopifyCustomerCount(
  options?: Omit<UseQueryOptions<number, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<number, Error>({
    queryKey: shopifyCustomerKeys.count(),
    queryFn: async () => {
      const response = await shopifyClient.getCustomerCount();
      return response.count;
    },
    staleTime: DATA_REFRESH_INTERVALS.SHOPIFY,
    ...options,
  });
}
