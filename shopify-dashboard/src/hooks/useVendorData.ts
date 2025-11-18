import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from './useSupabaseQuery';
import { toast } from 'sonner';

export interface Vendor {
  id: string;
  user_id: string;
  name: string;
  category?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  status: string;
  notes?: string;
  rating?: number;
  on_time_delivery?: number;
  cost_score?: number;
  quality_score?: number;
  overall_score?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateVendorData {
  name: string;
  category?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  status?: string;
  notes?: string;
  rating?: number;
  on_time_delivery?: number;
  cost_score?: number;
  quality_score?: number;
  overall_score?: number;
}

export interface UpdateVendorData extends Partial<CreateVendorData> {
  id: string;
}

export const useVendors = () => {
  return useSupabaseQuery<Vendor>(['vendors'], 'vendors');
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorData: CreateVendorData) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('vendors')
        .insert({
          ...vendorData,
          status: vendorData.status || 'active',
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created successfully');
    },
    onError: (error) => {
      console.error('Error creating vendor:', error);
      toast.error('Failed to create vendor');
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...vendorData }: UpdateVendorData) => {
      const { data, error } = await supabase
        .from('vendors')
        .update(vendorData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor updated successfully');
    },
    onError: (error) => {
      console.error('Error updating vendor:', error);
      toast.error('Failed to update vendor');
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
    },
  });
};