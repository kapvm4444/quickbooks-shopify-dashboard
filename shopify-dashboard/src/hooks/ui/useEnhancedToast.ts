import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

/**
 * Enhanced toast hook with predefined patterns for common scenarios
 * Provides consistent messaging and better UX
 */
export function useEnhancedToast() {
  const { toast } = useToast();

  const showSuccess = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: "default",
    });
  }, [toast]);

  const showError = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: "destructive",
    });
  }, [toast]);

  const showInfo = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
    });
  }, [toast]);

  const showLoading = useCallback((message: string = "Processing...") => {
    return toast({
      title: message,
      description: "Please wait while we complete your request.",
      duration: 0, // Don't auto-dismiss
    });
  }, [toast]);

  const showOperationSuccess = useCallback((operation: string, item?: string) => {
    showSuccess(
      `${operation} successful`,
      item ? `${item} was ${operation.toLowerCase()} successfully.` : undefined
    );
  }, [showSuccess]);

  const showOperationError = useCallback((operation: string, error?: string, item?: string) => {
    showError(
      `${operation} failed`,
      error || (item ? `Failed to ${operation.toLowerCase()} ${item}.` : "Please try again.")
    );
  }, [showError]);

  const showValidationError = useCallback((fields: string[]) => {
    showError(
      "Validation error",
      `Please check the following fields: ${fields.join(", ")}`
    );
  }, [showError]);

  const showNetworkError = useCallback(() => {
    showError(
      "Network error",
      "Please check your internet connection and try again."
    );
  }, [showError]);

  const showOptimisticUpdate = useCallback((operation: string, item?: string) => {
    showInfo(
      `${operation} in progress`,
      item ? `${item} is being ${operation.toLowerCase()}...` : "Changes will be saved automatically."
    );
  }, [showInfo]);

  return {
    toast,
    showSuccess,
    showError,
    showInfo,
    showLoading,
    showOperationSuccess,
    showOperationError,
    showValidationError,
    showNetworkError,
    showOptimisticUpdate
  };
}