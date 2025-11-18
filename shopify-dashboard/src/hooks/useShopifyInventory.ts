import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { shopifyClient } from "@/integrations/shopify/client";
import { DATA_REFRESH_INTERVALS } from "@/lib/constants";
import type { ShopifyInventoryLevel } from "@/integrations/shopify/types";

// Query Keys
export const shopifyInventoryKeys = {
  all: ["shopify", "inventory"] as const,
  levels: (params?: { inventory_item_ids?: string; location_ids?: string }) =>
    [...shopifyInventoryKeys.all, "levels", params] as const,
};

// Fetch Inventory Levels
export function useShopifyInventoryLevels(
  params?: {
    inventory_item_ids?: string;
    location_ids?: string;
    limit?: number;
  },
  options?: Omit<
    UseQueryOptions<ShopifyInventoryLevel[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<ShopifyInventoryLevel[], Error>({
    queryKey: shopifyInventoryKeys.levels(params),
    queryFn: async () => {
      const response = await shopifyClient.getInventoryLevels(params);
      return response.inventory_levels;
    },
    staleTime: DATA_REFRESH_INTERVALS.INVENTORY,
    ...options,
  });
}

// Adjust Inventory Level
export function useAdjustShopifyInventory() {
  const queryClient = useQueryClient();

  return useMutation<
    ShopifyInventoryLevel[],
    Error,
    {
      location_id: number;
      inventory_item_id: number;
      available_adjustment: number;
    }
  >({
    mutationFn: async (params) => {
      const response = await shopifyClient.adjustInventoryLevel(params);
      return response.inventory_levels;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyInventoryKeys.all });
    },
  });
}

// Set Inventory Level
export function useSetShopifyInventory() {
  const queryClient = useQueryClient();

  return useMutation<
    ShopifyInventoryLevel[],
    Error,
    {
      location_id: number;
      inventory_item_id: number;
      available: number;
    }
  >({
    mutationFn: async (params) => {
      const response = await shopifyClient.setInventoryLevel(params);
      return response.inventory_levels;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyInventoryKeys.all });
    },
  });
}
