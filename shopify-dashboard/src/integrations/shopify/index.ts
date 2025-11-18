// Shopify Integration - Main Export
export * from "./client";
export * from "./types";

// Re-export hooks
export {
  useShopifyProducts,
  useShopifyProduct,
  useShopifyProductCount,
  useCreateShopifyProduct,
  useUpdateShopifyProduct,
  useDeleteShopifyProduct,
} from "@/hooks/useShopifyProducts";

export {
  useShopifyOrders,
  useShopifyOrder,
  useShopifyOrderCount,
  useCreateShopifyOrder,
  useUpdateShopifyOrder,
  useCancelShopifyOrder,
  useCloseShopifyOrder,
} from "@/hooks/useShopifyOrders";

export {
  useShopifyInventoryLevels,
  useAdjustShopifyInventory,
  useSetShopifyInventory,
} from "@/hooks/useShopifyInventory";

export {
  useShopifyLocations,
  useShopifyLocation,
  useShopifyCustomers,
  useShopifyCustomer,
  useSearchShopifyCustomers,
  useShopifyCustomerCount,
} from "@/hooks/useShopifyCustomers";
