/**
 * Utility functions for formatting numbers and currency
 * Centralized formatting logic for consistency across the app
 */

export const formatCurrency = (
  amount: number,
  currency: string = "INR",
  locale: string = "en-IN",
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (
  value: number,
  locale: string = "en-US",
  options?: Intl.NumberFormatOptions,
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
};

export const formatPercentage = (
  value: number,
  locale: string = "en-US",
  decimals: number = 1,
): string => {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

export const formatCompactNumber = (
  value: number,
  locale: string = "en-US",
): string => {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
};

export const formatExactNumber = (
  value: number,
  locale: string = "en-US",
): string => {
  // For very small numbers, preserve up to 6 decimal places
  // For larger numbers, use appropriate precision
  let decimalPlaces = 0; // default

  if (Math.abs(value) < 1 && value !== 0) {
    // For values less than 1, determine decimal places needed
    const str = value.toString();
    const match = str.match(/\.(\d+)/);
    if (match) {
      decimalPlaces = Math.min(match[1].length, 6); // Max 6 decimal places for small values
    }
  } else if (value % 1 !== 0) {
    // For values >= 1 with decimals, check precision
    const str = value.toString();
    const match = str.match(/\.(\d+)/);
    if (match) {
      decimalPlaces = Math.min(match[1].length, 4); // Max 4 decimal places for larger values
    }
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping: false,
  }).format(value);
};

export const formatExactCurrency = (
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string => {
  // For very small numbers (like 0.091, 0.052), preserve up to 6 decimal places
  // For larger numbers, use appropriate precision
  let decimalPlaces = 2; // default for currency

  if (Math.abs(amount) < 1 && amount !== 0) {
    // For values less than 1, determine decimal places needed
    const str = amount.toString();
    const match = str.match(/\.(\d+)/);
    if (match) {
      decimalPlaces = Math.min(match[1].length, 6); // Max 6 decimal places for small values
    }
  } else if (amount % 1 !== 0) {
    // For values >= 1 with decimals, check precision
    const str = amount.toString();
    const match = str.match(/\.(\d+)/);
    if (match) {
      decimalPlaces = Math.min(match[1].length, 4); // Max 4 decimal places for larger values
    }
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping: true,
  }).format(amount);
};

export const formatMetricValue = (value: string | number): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value >= 1000000) {
    return formatCompactNumber(value);
  }

  return formatNumber(value);
};
