import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for optimistic updates - improves perceived performance
 * by immediately updating UI before server confirmation
 */
export function useOptimisticUpdate<T>() {
  const [optimisticData, setOptimisticData] = useState<T[]>([]);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const addOptimistic = useCallback((id: string, data: T) => {
    setOptimisticData(prev => [...prev, data]);
    setPendingOperations(prev => new Set([...prev, id]));
  }, []);

  const updateOptimistic = useCallback((id: string, data: Partial<T> & { id: string }) => {
    setOptimisticData(prev => prev.map(item => 
      (item as any).id === data.id ? { ...item, ...data } : item
    ));
    setPendingOperations(prev => new Set([...prev, id]));
  }, []);

  const removeOptimistic = useCallback((id: string, itemId: string) => {
    setOptimisticData(prev => prev.filter(item => (item as any).id !== itemId));
    setPendingOperations(prev => new Set([...prev, id]));
  }, []);

  const confirmOperation = useCallback((id: string) => {
    setPendingOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const revertOperation = useCallback((id: string, revertData?: T[]) => {
    setPendingOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    
    if (revertData) {
      setOptimisticData(revertData);
    }
    
    toast({
      title: "Operation failed",
      description: "Changes have been reverted. Please try again.",
      variant: "destructive",
    });
  }, [toast]);

  const isPending = useCallback((id: string) => {
    return pendingOperations.has(id);
  }, [pendingOperations]);

  return {
    optimisticData,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
    confirmOperation,
    revertOperation,
    isPending,
    hasPendingOperations: pendingOperations.size > 0
  };
}

/**
 * Hook for form submissions with optimistic updates
 */
export function useOptimisticForm<T extends { id: string }>() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitWithOptimistic = useCallback(async <R>(
    optimisticUpdate: () => void,
    apiCall: () => Promise<R>,
    successMessage?: string,
    onSuccess?: (result: R) => void,
    onError?: (error: Error) => void
  ) => {
    setIsSubmitting(true);
    
    // Apply optimistic update immediately
    optimisticUpdate();
    
    try {
      const result = await apiCall();
      
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      
      onSuccess?.(result);
      return result;
    } catch (error) {
      // Revert optimistic update on error
      onError?.(error as Error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [toast]);

  return {
    isSubmitting,
    submitWithOptimistic
  };
}