import { useSupabaseQuery } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export interface ARTransaction {
  id: string;
  user_id: string;
  customer_name: string;
  invoice_number?: string;
  amount: number;
  due_date?: string;
  transaction_date: string;
  description?: string;
  status: 'outstanding' | 'paid' | 'overdue';
  created_at: string;
  updated_at: string;
}

export interface APTransaction {
  id: string;
  user_id: string;
  vendor_id?: string;
  vendor_name: string;
  invoice_number?: string;
  amount: number;
  due_date?: string;
  transaction_date: string;
  description?: string;
  status: 'outstanding' | 'paid' | 'overdue';
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  created_at: string;
  updated_at: string;
}

export const useARTransactions = () => {
  return useSupabaseQuery<ARTransaction>(
    ['ar_transactions'],
    'ar_transactions',
    '*',
    {},
    true
  );
};

export const useAPTransactions = () => {
  return useSupabaseQuery<APTransaction>(
    ['ap_transactions'],
    'ap_transactions',
    '*',
    {},
    true
  );
};

export const useCreateARTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<ARTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from('ar_transactions')
        .insert({
          ...data,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ar_transactions'] });
      toast({
        title: "Success",
        description: "AR transaction created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create AR transaction",
        variant: "destructive"
      });
    }
  });
};

export const useCreateAPTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<APTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from('ap_transactions')
        .insert({
          ...data,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ap_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: "Success",
        description: "AP transaction created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create AP transaction",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateARTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ARTransaction> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('ar_transactions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ar_transactions'] });
      toast({
        title: "Success",
        description: "AR transaction updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update AR transaction",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateAPTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<APTransaction> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('ap_transactions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ap_transactions'] });
      toast({
        title: "Success",
        description: "AP transaction updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update AP transaction",
        variant: "destructive"
      });
    }
  });
};

export const useAPTransactionsByVendor = (vendorId: string) => {
  return useSupabaseQuery<APTransaction>(
    ['ap_transactions', 'vendor', vendorId], 
    'ap_transactions',
    '*',
    { 
      column: 'vendor_id', 
      operator: 'eq', 
      value: vendorId 
    }
  );
};