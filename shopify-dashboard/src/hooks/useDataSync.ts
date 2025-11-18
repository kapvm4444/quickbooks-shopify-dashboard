import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface SyncGoogleSheetsParams {
  spreadsheetId: string;
  range: string;
  recordType?: 'revenue' | 'expense' | 'asset' | 'liability';
  mapping?: Record<string, string>; // column mapping
  pageKey?: string; // context page
}

interface SyncQuickBooksParams {
  companyId: string;
  syncType?: string;
  pageKey?: string;
}

export function useDataSync() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncGoogleSheets = async (params: SyncGoogleSheetsParams) => {
    setIsLoading(true);
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('sync-google-sheets', {
        body: {
          ...params,
          user_id: user.id
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Function invocation failed');
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.success) {
        console.error('Function did not succeed:', data);
        throw new Error(data?.error || 'Sync operation failed');
      }

      toast({
        title: "Google Sheets Sync Complete",
        description: `Successfully synced ${data.recordsProcessed} records`,
      });

      // Invalidate financial data queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['financial-records'] });

      return data;
    } catch (error) {
      console.error('Google Sheets sync error:', error);
      let errorMessage = error instanceof Error ? error.message : 'Failed to sync Google Sheets data';
      
      // Provide helpful guidance for common errors
      if (errorMessage.includes('Permission denied') || errorMessage.includes('does not have permission')) {
        errorMessage = `🔒 Google Sheet is Private\n\nTo fix this:\n1. Open your Google Sheet\n2. Click "Share" (top right)\n3. Change to "Anyone with the link"\n4. Set permission to "Viewer"\n5. Try syncing again`;
      }
      
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncQuickBooks = async (params: SyncQuickBooksParams) => {
    setIsLoading(true);
    try {
      // Get the current user to include in the request
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get the current session to pass the JWT token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      console.log('Syncing QuickBooks for user:', user.id, 'params:', params);

      const { data, error } = await supabase.functions.invoke('sync-quickbooks', {
        body: {
          ...params,
          user_id: user.id
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Function invocation failed');
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.success) {
        console.error('Function did not succeed:', data);
        throw new Error(data?.error || 'Sync operation failed');
      }

      toast({
        title: "QuickBooks Sync Complete",
        description: `Successfully synced ${data.recordsProcessed} records`,
      });

      // Invalidate financial data queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['financial-records'] });

      return data;
    } catch (error) {
      console.error('QuickBooks sync error:', error);
      let errorMessage = error instanceof Error ? error.message : 'Failed to sync QuickBooks data';
      
      // Provide helpful guidance for common errors
      if (errorMessage.includes('not authenticated') || errorMessage.includes('Invalid user authentication')) {
        errorMessage = 'Please log in and reconnect to QuickBooks to sync data.';
      } else if (errorMessage.includes('connection not found')) {
        errorMessage = 'QuickBooks connection not found. Please reconnect to QuickBooks.';
      }
      
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncGoogleSheets,
    syncQuickBooks,
    isLoading
  };
}