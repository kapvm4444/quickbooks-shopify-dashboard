import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values to improve performance
 * Prevents excessive API calls and improves user experience
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to cancel the timeout if value changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for debounced search functionality
 * Combines debounced value with search-specific logic
 * 
 * @param searchTerm - The search term to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Object with debouncedSearch and isSearching state
 */
export function useDebouncedSearch(searchTerm: string, delay: number = 300) {
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebouncedValue(searchTerm, delay);

  useEffect(() => {
    if (searchTerm !== debouncedSearch) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearch]);

  return {
    debouncedSearch,
    isSearching
  };
}