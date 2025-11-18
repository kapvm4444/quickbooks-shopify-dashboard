// Shopify API Types

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string;
  template_suffix: string | null;
  status: "active" | "archived" | "draft";
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  image: ShopifyImage | null;
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  fulfillment_service: string;
  inventory_management: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  image_id: number | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
}

export interface ShopifyOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: number[];
  admin_graphql_api_id: string;
}

export interface ShopifyDiscountCode {
  code: string;
  amount: string;
  type: string;
}

export interface ShopifyTaxLine {
  title: string;
  price: string;
  rate: number;
}

export interface ShopifyPriceSet {
  shop_money: {
    amount: string;
    currency_code: string;
  };
  presentment_money: {
    amount: string;
    currency_code: string;
  };
}

export interface ShopifyOrder {
  id: number;
  admin_graphql_api_id: string;
  app_id: number;
  browser_ip: string | null;
  buyer_accepts_marketing: boolean;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cart_token: string | null;
  checkout_id: number | null;
  checkout_token: string | null;
  closed_at: string | null;
  confirmed: boolean;
  contact_email: string;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_total_discounts: string;
  current_total_price: string;
  current_total_tax: string;
  customer_locale: string | null;
  device_id: number | null;
  discount_codes: ShopifyDiscountCode[];
  email: string;
  estimated_taxes: boolean;
  financial_status:
    | "pending"
    | "authorized"
    | "paid"
    | "partially_paid"
    | "refunded"
    | "voided"
    | "partially_refunded";
  fulfillment_status: "fulfilled" | "partial" | "restocked" | null;
  gateway: string;
  landing_site: string | null;
  landing_site_ref: string | null;
  location_id: number | null;
  name: string;
  note: string | null;
  note_attributes: Array<{ name: string; value: string }>;
  number: number;
  order_number: number;
  order_status_url: string;
  original_total_duties_set: ShopifyPriceSet | null;
  payment_gateway_names: string[];
  phone: string | null;
  presentment_currency: string;
  processed_at: string;
  processing_method: string;
  reference: string | null;
  referring_site: string | null;
  source_identifier: string | null;
  source_name: string;
  source_url: string | null;
  subtotal_price: string;
  tags: string;
  tax_lines: ShopifyTaxLine[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_line_items_price: string;
  total_outstanding: string;
  total_price: string;
  total_tax: string;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: number | null;
  billing_address: ShopifyAddress | null;
  customer: ShopifyCustomer;
  discount_applications: Array<{
    type: string;
    value: string;
    value_type: string;
    allocation_method: string;
    target_selection: string;
    target_type: string;
  }>;
  fulfillments: Array<{
    id: number;
    order_id: number;
    status: string;
    created_at: string;
    tracking_number: string | null;
    tracking_numbers: string[];
    tracking_url: string | null;
    tracking_urls: string[];
  }>;
  line_items: ShopifyLineItem[];
  payment_details: {
    credit_card_bin: string | null;
    avs_result_code: string | null;
    cvv_result_code: string | null;
    credit_card_number: string | null;
    credit_card_company: string | null;
  } | null;
  refunds: Array<{
    id: number;
    order_id: number;
    created_at: string;
    note: string | null;
    user_id: number | null;
  }>;
  shipping_address: ShopifyAddress | null;
  shipping_lines: Array<{
    id: number;
    title: string;
    price: string;
    code: string;
    source: string;
  }>;
}

export interface ShopifyAddress {
  first_name: string;
  address1: string;
  phone: string;
  city: string;
  zip: string;
  province: string;
  country: string;
  last_name: string;
  address2: string | null;
  company: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string;
  country_code: string;
  province_code: string;
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: number | null;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  tags: string;
  last_order_name: string | null;
  currency: string;
  phone: string | null;
  addresses: ShopifyAddress[];
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string | null;
  tax_exemptions: string[];
  admin_graphql_api_id: string;
  default_address: ShopifyAddress;
}

export interface ShopifyLineItem {
  id: number;
  admin_graphql_api_id: string;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status: string | null;
  gift_card: boolean;
  grams: number;
  name: string;
  price: string;
  price_set: ShopifyPriceSet;
  product_exists: boolean;
  product_id: number;
  properties: Array<{ name: string; value: string }>;
  quantity: number;
  requires_shipping: boolean;
  sku: string;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: ShopifyPriceSet;
  variant_id: number;
  variant_inventory_management: string;
  variant_title: string | null;
  vendor: string;
  tax_lines: ShopifyTaxLine[];
  duties: Array<{
    id: string;
    harmonized_system_code: string;
    country_code_of_origin: string;
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  }>;
  discount_allocations: Array<{
    amount: string;
    discount_application_index: number;
    amount_set: ShopifyPriceSet;
  }>;
}

export interface ShopifyInventoryLevel {
  inventory_item_id: number;
  location_id: number;
  available: number;
  updated_at: string;
  admin_graphql_api_id: string;
}

export interface ShopifyLocation {
  id: number;
  name: string;
  address1: string;
  address2: string | null;
  city: string;
  zip: string;
  province: string | null;
  country: string;
  phone: string;
  created_at: string;
  updated_at: string;
  country_code: string;
  country_name: string;
  province_code: string | null;
  legacy: boolean;
  active: boolean;
  admin_graphql_api_id: string;
}

// Request/Response wrappers
export interface ShopifyProductsResponse {
  products: ShopifyProduct[];
}

export interface ShopifyProductResponse {
  product: ShopifyProduct;
}

export interface ShopifyOrdersResponse {
  orders: ShopifyOrder[];
}

export interface ShopifyOrderResponse {
  order: ShopifyOrder;
}

export interface ShopifyInventoryLevelsResponse {
  inventory_levels: ShopifyInventoryLevel[];
}

export interface ShopifyLocationsResponse {
  locations: ShopifyLocation[];
}

export interface ShopifyCustomersResponse {
  customers: ShopifyCustomer[];
}

export interface ShopifyCustomerResponse {
  customer: ShopifyCustomer;
}

// Create/Update payloads
export interface CreateProductPayload {
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  status?: "active" | "archived" | "draft";
  variants?: Array<{
    price: string;
    sku?: string;
    inventory_quantity?: number;
    inventory_management?: string;
  }>;
  images?: Array<{
    src: string;
    alt?: string;
  }>;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id?: number;
}

export interface CreateOrderPayload {
  line_items: Array<{
    variant_id: number;
    quantity: number;
  }>;
  customer?: {
    id?: number;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  billing_address?: Partial<ShopifyAddress>;
  shipping_address?: Partial<ShopifyAddress>;
  email?: string;
  financial_status?: string;
  send_receipt?: boolean;
  send_fulfillment_receipt?: boolean;
}

// Query parameters
export interface ProductQueryParams {
  limit?: number;
  page_info?: string;
  since_id?: number;
  created_at_min?: string;
  created_at_max?: string;
  updated_at_min?: string;
  updated_at_max?: string;
  published_at_min?: string;
  published_at_max?: string;
  published_status?: "published" | "unpublished" | "any";
  vendor?: string;
  product_type?: string;
  collection_id?: number;
  status?: "active" | "archived" | "draft";
  fields?: string;
}

export interface OrderQueryParams {
  limit?: number;
  page_info?: string;
  since_id?: number;
  created_at_min?: string;
  created_at_max?: string;
  updated_at_min?: string;
  updated_at_max?: string;
  processed_at_min?: string;
  processed_at_max?: string;
  status?: "open" | "closed" | "cancelled" | "any";
  financial_status?:
    | "authorized"
    | "pending"
    | "paid"
    | "partially_paid"
    | "refunded"
    | "voided"
    | "partially_refunded"
    | "any";
  fulfillment_status?:
    | "shipped"
    | "partial"
    | "unshipped"
    | "any"
    | "unfulfilled";
  fields?: string;
}
