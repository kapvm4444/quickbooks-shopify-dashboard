import { z } from 'zod';

/**
 * Validation schemas for business data
 * Centralized validation logic with proper error handling
 */

export const skuSchema = z.object({
  id: z.string(),
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  cost: z.number().min(0, 'Cost must be positive'),
  margin: z.number().min(0).max(100, 'Margin must be between 0-100%'),
  stock: z.number().int().min(0, 'Stock must be a positive integer'),
  status: z.enum(['Active', 'Inactive', 'Discontinued']),
  quantity: z.number().int().min(0),
  totalValue: z.number().min(0)
});

export const financialRecordSchema = z.object({
  id: z.string(),
  source: z.string(),
  record_type: z.enum(['revenue', 'expense', 'asset', 'liability']),
  amount: z.number(),
  description: z.string(),
  category: z.string().nullable(),
  account_name: z.string().nullable(),
  transaction_date: z.string().datetime(),
  external_id: z.string().nullable(),
});

export const socialMediaMetricSchema = z.object({
  id: z.string(),
  platform: z.string(),
  metric_type: z.string(),
  metric_value: z.number(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
});

export type SKU = z.infer<typeof skuSchema>;
export type FinancialRecord = z.infer<typeof financialRecordSchema>;
export type SocialMediaMetric = z.infer<typeof socialMediaMetricSchema>;

/**
 * Validation helper functions
 */
export const validateSKUData = (data: unknown): SKU[] => {
  if (!Array.isArray(data)) {
    throw new Error('SKU data must be an array');
  }
  
  return data.map((item, index) => {
    try {
      return skuSchema.parse(item);
    } catch (error) {
      console.error(`Invalid SKU data at index ${index}:`, error);
      throw new Error(`Invalid SKU data at index ${index}`);
    }
  });
};

export const isValidCurrency = (amount: number): boolean => {
  return typeof amount === 'number' && !isNaN(amount) && isFinite(amount);
};

export const isValidPercentage = (value: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= 100;
};