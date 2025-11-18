import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface VendorContact {
  id: string;
  vendor_id: string;
  user_id: string;
  name: string;
  role: 'primary' | 'billing' | 'technical' | 'sales' | 'support' | 'procurement' | 'quality' | 'logistics' | 'other';
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVendorContactData {
  vendor_id: string;
  name: string;
  role: VendorContact['role'];
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
  is_primary?: boolean;
  notes?: string;
}

export interface UpdateVendorContactData extends Partial<CreateVendorContactData> {
  id: string;
}

// Hook to get contacts for a specific vendor
export const useVendorContacts = (vendorId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vendor-contacts', vendorId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('vendor_contacts')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as VendorContact[];
    },
    enabled: !!user && !!vendorId,
  });
};

// Hook to create a new vendor contact
export const useCreateVendorContact = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactData: CreateVendorContactData) => {
      if (!user) throw new Error('User not authenticated');

      // If this contact is being set as primary, first remove primary flag from others
      if (contactData.is_primary) {
        await supabase
          .from('vendor_contacts')
          .update({ is_primary: false })
          .eq('vendor_id', contactData.vendor_id)
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('vendor_contacts')
        .insert({
          ...contactData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as VendorContact;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contacts', data.vendor_id] });
      toast({
        title: 'Success',
        description: 'Contact added successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating vendor contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to add contact',
        variant: 'destructive',
      });
    },
  });
};

// Hook to update a vendor contact
export const useUpdateVendorContact = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactData: UpdateVendorContactData) => {
      if (!user) throw new Error('User not authenticated');

      const { id, ...updateData } = contactData;

      // If this contact is being set as primary, first remove primary flag from others
      if (updateData.is_primary && updateData.vendor_id) {
        await supabase
          .from('vendor_contacts')
          .update({ is_primary: false })
          .eq('vendor_id', updateData.vendor_id)
          .eq('user_id', user.id)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('vendor_contacts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as VendorContact;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contacts', data.vendor_id] });
      toast({
        title: 'Success',
        description: 'Contact updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating vendor contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contact',
        variant: 'destructive',
      });
    },
  });
};

// Hook to delete a vendor contact
export const useDeleteVendorContact = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, vendorId }: { id: string; vendorId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('vendor_contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { id, vendorId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contacts', data.vendorId] });
      toast({
        title: 'Success',
        description: 'Contact deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting vendor contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contact',
        variant: 'destructive',
      });
    },
  });
};

// Helper function to get role display name
export const getRoleDisplayName = (role: VendorContact['role']): string => {
  const roleNames = {
    primary: 'Primary Contact',
    billing: 'Billing Contact',
    technical: 'Technical Contact',
    sales: 'Sales Contact',
    support: 'Support Contact',
    procurement: 'Procurement Contact',
    quality: 'Quality Contact',
    logistics: 'Logistics Contact',
    other: 'Other',
  };
  return roleNames[role] || role;
};

// Helper function to get role color class
export const getRoleColorClass = (role: VendorContact['role']): string => {
  const roleColors = {
    primary: 'bg-blue-100 text-blue-800',
    billing: 'bg-green-100 text-green-800',
    technical: 'bg-purple-100 text-purple-800',
    sales: 'bg-orange-100 text-orange-800',
    support: 'bg-yellow-100 text-yellow-800',
    procurement: 'bg-indigo-100 text-indigo-800',
    quality: 'bg-pink-100 text-pink-800',
    logistics: 'bg-teal-100 text-teal-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return roleColors[role] || roleColors.other;
};