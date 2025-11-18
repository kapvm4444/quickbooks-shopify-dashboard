/**
 * Centralized error handling utilities
 * Provides consistent error handling patterns across the application
 */

import { toast } from 'sonner';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  operation?: string;
  component?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface AppError {
  message: string;
  severity: ErrorSeverity;
  context?: ErrorContext;
  originalError?: Error;
  timestamp: Date;
}

/**
 * Creates a standardized error object
 */
export function createAppError(
  message: string,
  severity: ErrorSeverity = 'medium',
  context?: ErrorContext,
  originalError?: Error
): AppError {
  return {
    message,
    severity,
    context,
    originalError,
    timestamp: new Date()
  };
}

/**
 * Handles errors consistently across the application
 */
export function handleError(
  error: Error | string | AppError,
  context?: ErrorContext,
  severity: ErrorSeverity = 'medium'
): AppError {
  let appError: AppError;

  if (typeof error === 'string') {
    appError = createAppError(error, severity, context);
  } else if ('severity' in error && 'timestamp' in error) {
    // Already an AppError
    appError = error;
  } else {
    appError = createAppError(
      error.message || 'An unexpected error occurred',
      severity,
      context,
      error
    );
  }

  // Log error for debugging (only in development or with specific logging setup)
  if (process.env.NODE_ENV === 'development') {
    console.error('App Error:', {
      message: appError.message,
      severity: appError.severity,
      context: appError.context,
      originalError: appError.originalError,
      timestamp: appError.timestamp
    });
  }

  return appError;
}

/**
 * Shows user-friendly error messages based on severity
 */
export function showErrorToUser(error: AppError | Error | string, fallbackMessage?: string): void {
  let message: string;
  let severity: ErrorSeverity = 'medium';

  if (typeof error === 'string') {
    message = error;
  } else if ('severity' in error && 'message' in error) {
    message = error.message;
    severity = error.severity;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = fallbackMessage || 'An unexpected error occurred';
  }

  // Show appropriate toast based on severity
  switch (severity) {
    case 'low':
      toast.info(message);
      break;
    case 'critical':
    case 'high':
      toast.error(message, {
        duration: 10000 // Longer duration for critical errors
      });
      break;
    default:
      toast.error(message);
  }
}

/**
 * Wraps async operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: ErrorContext,
  showToUser = true
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const appError = handleError(error as Error, context);
    
    if (showToUser) {
      showErrorToUser(appError);
    }
    
    return null;
  }
}

/**
 * Error boundary helper for consistent error UI
 */
export function getErrorBoundaryFallback(error: Error, componentName?: string) {
  return {
    message: 'Something went wrong',
    details: error.message,
    componentName,
    canRetry: true
  };
}

/**
 * Common error messages for consistency
 */
export const ErrorMessages = {
  NETWORK: 'Unable to connect. Please check your internet connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER: 'A server error occurred. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
  
  // Operation-specific
  SAVE_FAILED: 'Failed to save changes. Please try again.',
  DELETE_FAILED: 'Failed to delete item. Please try again.',
  LOAD_FAILED: 'Failed to load data. Please refresh the page.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.'
} as const;

/**
 * Retries an operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}