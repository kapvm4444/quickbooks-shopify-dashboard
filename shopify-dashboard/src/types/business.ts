export interface FinancialRecord {
  id: string;
  source: string;
  record_type: string;
  amount: number;
  description: string;
  category: string | null;
  account_name: string | null;
  transaction_date: string;
  external_id: string | null;
  payee?: string | null;
  chart_account_code?: string | null;
  chart_account_name?: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
  recurrence_day?: number | null;
  next_due_date?: string | null;
  end_date?: string | null;
}

export interface ChartOfAccounts {
  id: string;
  user_id: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_account_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaMetric {
  id: string;
  platform: string;
  metric_type: string;
  metric_value: number;
  period_start: string;
  period_end: string;
  page_id?: string;
  post_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ShopifyOrder {
  id: string;
  shopify_order_id: number;
  order_number: string;
  order_date: string;
  total_price: number;
  subtotal_price?: number;
  total_tax?: number;
  currency: string;
  customer_name?: string;
  customer_email?: string;
  order_status?: string;
  payment_status?: string;
  fulfillment_status?: string;
  line_items?: any;
  shipping_address?: any;
  created_at: string;
  updated_at: string;
}

export interface SKUItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  margin: number;
  stock: number;
  status: string;
  totalValue: number;
  quantity: number;
  current_po_number?: string;
}

export interface PlatformData {
  name: string;
  platform: string;
  followers: number;
  engagement: number;
  reach: number;
  metrics: SocialMediaMetric[];
}