/**
 * Centralized loading state management utilities
 * Provides consistent loading state patterns across the application
 */

export interface LoadingState {
  isLoading: boolean;
  error?: Error | string | null;
  data?: any;
}

export interface AsyncOperationState extends LoadingState {
  execute: (...args: any[]) => Promise<any>;
  reset: () => void;
}

/**
 * Combines multiple loading states into a single state
 * Useful when multiple queries need to complete before showing content
 */
export function combineLoadingStates(...states: boolean[]): boolean {
  return states.some(state => state === true);
}

/**
 * Checks if any of the provided states has an error
 */
export function hasAnyError(...errors: (Error | string | null | undefined)[]): boolean {
  return errors.some(error => error != null);
}

/**
 * Gets the first non-null error from multiple error states
 */
export function getFirstError(...errors: (Error | string | null | undefined)[]): Error | string | null {
  return errors.find(error => error != null) || null;
}

/**
 * Standard loading state for components
 */
export const createLoadingState = (
  isLoading = false, 
  error: Error | string | null = null, 
  data: any = null
): LoadingState => ({
  isLoading,
  error,
  data
});

/**
 * Loading state constants for common scenarios
 */
export const LoadingStates = {
  IDLE: createLoadingState(false, null, null),
  LOADING: createLoadingState(true, null, null),
  SUCCESS: (data: any) => createLoadingState(false, null, data),
  ERROR: (error: Error | string) => createLoadingState(false, error, null)
} as const;

/**
 * Hook-like utility for managing async operation states
 */
export class AsyncOperation<T = any> {
  private _state: LoadingState = LoadingStates.IDLE;
  private _subscribers: Set<(state: LoadingState) => void> = new Set();

  constructor(private operation: (...args: any[]) => Promise<T>) {}

  get state(): LoadingState {
    return this._state;
  }

  subscribe(callback: (state: LoadingState) => void): () => void {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }

  private notify(): void {
    this._subscribers.forEach(callback => callback(this._state));
  }

  async execute(...args: any[]): Promise<T> {
    this._state = LoadingStates.LOADING;
    this.notify();

    try {
      const result = await this.operation(...args);
      this._state = LoadingStates.SUCCESS(result);
      this.notify();
      return result;
    } catch (error) {
      this._state = LoadingStates.ERROR(error as Error);
      this.notify();
      throw error;
    }
  }

  reset(): void {
    this._state = LoadingStates.IDLE;
    this.notify();
  }
}