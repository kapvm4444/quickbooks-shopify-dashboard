// Application-wide constants
export const APP_CONFIG = {
  name: "Business Analytics Dashboard",
  description: "Comprehensive business intelligence platform",
  version: "2.0.0",
} as const;

// Shopify API Configuration
export const SHOPIFY_CONFIG = {
  STORE: import.meta.env.VITE_SHOPIFY_STORE || "",
  ACCESS_TOKEN: import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN || "",
  API_VERSION: import.meta.env.VITE_SHOPIFY_API_VERSION || "2024-01",
} as const;

export const DATA_REFRESH_INTERVALS = {
  FINANCIAL: 5 * 60 * 1000, // 5 minutes
  SOCIAL_MEDIA: 15 * 60 * 1000, // 15 minutes
  INVENTORY: 10 * 60 * 1000, // 10 minutes
  ANALYTICS: 30 * 60 * 1000, // 30 minutes
  SHOPIFY: 5 * 60 * 1000, // 5 minutes
} as const;

export const SUPPORTED_INTEGRATIONS = {
  QUICKBOOKS: "quickbooks",
  GOOGLE_SHEETS: "google_sheets",
  SHOPIFY: "shopify",
  EXCEL: "excel",
} as const;

export const RECORD_TYPES = {
  REVENUE: "revenue",
  EXPENSE: "expense",
  ASSET: "asset",
  LIABILITY: "liability",
} as const;

export const SOCIAL_PLATFORMS = {
  FACEBOOK: "facebook",
  INSTAGRAM: "instagram",
  TWITTER: "twitter",
  TIKTOK: "tiktok",
  YOUTUBE: "youtube",
  LINKEDIN: "linkedin",
} as const;
