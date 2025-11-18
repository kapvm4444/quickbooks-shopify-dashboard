/**
 * Performance monitoring utilities
 * Provides consistent performance tracking across the application
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ComponentPerformanceData {
  renderCount: number;
  lastRenderTime: Date;
  averageRenderDuration: number;
  slowRenders: number; // Renders > 16ms
}

/**
 * Simple performance timer for measuring operations
 */
export class PerformanceTimer {
  private startTime: number;
  private endTime?: number;

  constructor(private name: string) {
    this.startTime = performance.now();
  }

  end(metadata?: Record<string, any>): PerformanceMetric {
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;
    
    const metric: PerformanceMetric = {
      name: this.name,
      duration,
      timestamp: new Date(),
      metadata
    };

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.warn(`Slow operation detected: ${this.name} took ${duration.toFixed(2)}ms`, metadata);
    }

    return metric;
  }

  static measure<T>(name: string, operation: () => T, metadata?: Record<string, any>): T {
    const timer = new PerformanceTimer(name);
    try {
      const result = operation();
      timer.end(metadata);
      return result;
    } catch (error) {
      timer.end({ ...metadata, error: (error as Error).message });
      throw error;
    }
  }

  static async measureAsync<T>(
    name: string, 
    operation: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    const timer = new PerformanceTimer(name);
    try {
      const result = await operation();
      timer.end(metadata);
      return result;
    } catch (error) {
      timer.end({ ...metadata, error: (error as Error).message });
      throw error;
    }
  }
}

/**
 * Tracks component render performance
 */
export class ComponentPerformanceTracker {
  private static instances = new Map<string, ComponentPerformanceData>();

  static trackRender(componentName: string, renderDuration: number): void {
    const existing = this.instances.get(componentName) || {
      renderCount: 0,
      lastRenderTime: new Date(),
      averageRenderDuration: 0,
      slowRenders: 0
    };

    const newRenderCount = existing.renderCount + 1;
    const newAverage = (existing.averageRenderDuration * existing.renderCount + renderDuration) / newRenderCount;

    this.instances.set(componentName, {
      renderCount: newRenderCount,
      lastRenderTime: new Date(),
      averageRenderDuration: newAverage,
      slowRenders: existing.slowRenders + (renderDuration > 16 ? 1 : 0)
    });

    // Warn about slow renders in development
    if (process.env.NODE_ENV === 'development' && renderDuration > 16) {
      console.warn(`Slow render detected in ${componentName}: ${renderDuration.toFixed(2)}ms`);
    }
  }

  static getPerformanceData(componentName: string): ComponentPerformanceData | undefined {
    return this.instances.get(componentName);
  }

  static getAllPerformanceData(): Map<string, ComponentPerformanceData> {
    return new Map(this.instances);
  }

  static reset(componentName?: string): void {
    if (componentName) {
      this.instances.delete(componentName);
    } else {
      this.instances.clear();
    }
  }
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memoization utility for expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}