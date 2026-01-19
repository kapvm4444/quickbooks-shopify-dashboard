import type {
  ShopifyProductsResponse,
  ShopifyProductResponse,
  ShopifyOrdersResponse,
  ShopifyOrderResponse,
  ShopifyInventoryLevelsResponse,
  ShopifyLocationsResponse,
  ShopifyLocation,
  ShopifyCustomersResponse,
  ShopifyCustomerResponse,
  CreateProductPayload,
  UpdateProductPayload,
  CreateOrderPayload,
  ProductQueryParams,
  OrderQueryParams,
} from "./types";

// Shopify API Client
class ShopifyClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/shopify`;
    this.headers = {
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.errors || errorJson.error || errorText;
        } catch {
          errorMessage = errorText;
        }

        throw new Error(
          `Shopify API Error (${response.status}): ${errorMessage}`,
        );
      }

      // Handle empty responses (e.g., DELETE requests)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unknown error occurred while calling Shopify API");
    }
  }

  private buildQueryString(
    params?: Record<string, unknown> | ProductQueryParams | OrderQueryParams,
  ): string {
    if (!params) return "";

    const filteredParams = Object.entries(params)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      )
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&");

    return filteredParams ? `?${filteredParams}` : "";
  }

  // Products - removed .json suffix to match backend routes
  async getProducts(
    params?: ProductQueryParams,
  ): Promise<ShopifyProductsResponse> {
    const queryString = this.buildQueryString(params);
    return this.request<ShopifyProductsResponse>(
      `/products${queryString}`,
    );
  }

  async getProduct(
    productId: number | string,
  ): Promise<ShopifyProductResponse> {
    return this.request<ShopifyProductResponse>(`/products/${productId}`);
  }

  // Create/Update/Delete - kept .json in case backend handles them via wildcard or future update, 
  // BUT consistent with GETs being proxy, I should probably remove .json if I implement them in backend.
  // For now I'll remove .json assuming consistency, but they will 404 until implemented.
  async createProduct(
    payload: CreateProductPayload,
  ): Promise<ShopifyProductResponse> {
    return this.request<ShopifyProductResponse>("/products", {
      method: "POST",
      body: JSON.stringify({ product: payload }),
    });
  }

  async updateProduct(
    productId: number | string,
    payload: UpdateProductPayload,
  ): Promise<ShopifyProductResponse> {
    return this.request<ShopifyProductResponse>(`/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ product: payload }),
    });
  }

  async deleteProduct(productId: number | string): Promise<void> {
    await this.request<void>(`/products/${productId}`, {
      method: "DELETE",
    });
  }

  async getProductCount(
    params?: Omit<ProductQueryParams, "limit" | "page_info">,
  ): Promise<{ count: number }> {
    const queryString = this.buildQueryString(params);
    return this.request<{ count: number }>(
      `/products/count${queryString}`,
    );
  }

  // Orders
  async getOrders(params?: OrderQueryParams): Promise<ShopifyOrdersResponse> {
    const queryString = this.buildQueryString(params);
    return this.request<ShopifyOrdersResponse>(`/orders${queryString}`);
  }

  async getOrder(orderId: number | string): Promise<ShopifyOrderResponse> {
    return this.request<ShopifyOrderResponse>(`/orders/${orderId}`);
  }

  async createOrder(
    payload: CreateOrderPayload,
  ): Promise<ShopifyOrderResponse> {
    return this.request<ShopifyOrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify({ order: payload }),
    });
  }

  async updateOrder(
    orderId: number | string,
    payload: Partial<CreateOrderPayload>,
  ): Promise<ShopifyOrderResponse> {
    return this.request<ShopifyOrderResponse>(`/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({ order: payload }),
    });
  }

  async cancelOrder(
    orderId: number | string,
    reason?: string,
  ): Promise<ShopifyOrderResponse> {
    return this.request<ShopifyOrderResponse>(
      `/orders/${orderId}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
    );
  }

  async closeOrder(orderId: number | string): Promise<ShopifyOrderResponse> {
    return this.request<ShopifyOrderResponse>(`/orders/${orderId}/close`, {
      method: "POST",
    });
  }

  async getOrderCount(
    params?: Omit<OrderQueryParams, "limit" | "page_info">,
  ): Promise<{ count: number }> {
    const queryString = this.buildQueryString(params);
    return this.request<{ count: number }>(`/orders/count${queryString}`);
  }

  // Inventory
  async getInventoryLevels(params?: {
    inventory_item_ids?: string;
    location_ids?: string;
    limit?: number;
  }): Promise<ShopifyInventoryLevelsResponse> {
    const queryString = this.buildQueryString(params);
    return this.request<ShopifyInventoryLevelsResponse>(
      `/inventory_levels${queryString}`,
    );
  }

  async adjustInventoryLevel(params: {
    location_id: number;
    inventory_item_id: number;
    available_adjustment: number;
  }): Promise<ShopifyInventoryLevelsResponse> {
    return this.request<ShopifyInventoryLevelsResponse>(
      "/inventory_levels/adjust",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
  }

  async setInventoryLevel(params: {
    location_id: number;
    inventory_item_id: number;
    available: number;
  }): Promise<ShopifyInventoryLevelsResponse> {
    return this.request<ShopifyInventoryLevelsResponse>(
      "/inventory_levels/set",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
  }

  // Locations
  async getLocations(): Promise<ShopifyLocationsResponse> {
    return this.request<ShopifyLocationsResponse>("/locations");
  }

  async getLocation(
    locationId: number | string,
  ): Promise<{ location: ShopifyLocation }> {
    return this.request<{ location: ShopifyLocation }>(
      `/locations/${locationId}`,
    );
  }

  // Customers
  async getCustomers(params?: {
    limit?: number;
    since_id?: number;
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
  }): Promise<ShopifyCustomersResponse> {
    const queryString = this.buildQueryString(params);
    return this.request<ShopifyCustomersResponse>(
      `/customers${queryString}`,
    );
  }

  async getCustomer(
    customerId: number | string,
  ): Promise<ShopifyCustomerResponse> {
    return this.request<ShopifyCustomerResponse>(
      `/customers/${customerId}`,
    );
  }

  async searchCustomers(query: string): Promise<ShopifyCustomersResponse> {
    return this.request<ShopifyCustomersResponse>(
      `/customers/search?query=${encodeURIComponent(query)}`,
    );
  }

  async getCustomerCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>("/customers/count");
  }
}

// Export singleton instance
export const shopifyClient = new ShopifyClient();
