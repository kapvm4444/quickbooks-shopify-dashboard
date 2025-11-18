import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Keep a type for all TABLE names (exclude views here)
type TableName =
  | 'financial_records'
  | 'social_media_metrics'
  | 'shopify_orders'
  | 'website_analytics'
  | 'integration_sync_logs'
  | 'quickbooks_connections'
  | 'workbook_uploads'
  | 'goals'
  | 'financial_model_assumptions'
  | 'financial_model_key_metrics'
  | 'funding_rounds'
  | 'use_of_funds'
  | 'lead_investors'
  | 'funding_milestones'
  | 'funding_next_steps'
  | 'skus'
  | 'inventory_items'
  | 'vendors'
  | 'funding_overview'
  | 'investors'
  | 'funding_round_investments'
  | 'data_import_runs'
  | 'data_import_diffs'
  | 'data_sync_schedules'
  | 'data_sync_sources'
  | 'launch_budget_items'
  | 'profiles'
  | 'tasks'
  | 'task_comments'
  | 'ar_transactions'
  | 'ap_transactions'
  | 'chart_of_accounts'
  | 'purchase_orders'
  | 'purchase_order_line_items';

// Keep a separate type for VIEW names
type ViewName = 'investor_stats';

// Overload signatures: one for tables, one for views
export function useSupabaseQuery<T>(
  queryKey: (string | number | undefined)[],
  tableName: TableName,
  selectQuery?: string,
  filters?: Record<string, any>,
  enableRealtime?: boolean
): UseQueryResult<T[], unknown>;

export function useSupabaseQuery<T>(
  queryKey: (string | number | undefined)[],
  tableName: ViewName,
  selectQuery?: string,
  filters?: Record<string, any>,
  enableRealtime?: boolean
): UseQueryResult<T[], unknown>;

// Implementation signature uses a general string to avoid overload conflict internally
export function useSupabaseQuery<T>(
  queryKey: (string | number | undefined)[],
  tableName: string,
  selectQuery: string = '*',
  filters?: Record<string, any>,
  enableRealtime: boolean = true
) {
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // Cast to any to avoid Supabase from() overload issues when mixing tables and views
      let q = (supabase.from as any)(tableName).select(selectQuery) as any;

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            q = q.eq(key, value);
          }
        });
      }

      const { data, error } = await q;

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw error;
      }

      return data as T[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Set up real-time subscriptions (should remain disabled for views like investor_stats)
  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase
      .channel(`${tableName}-${queryKey.filter((k) => k !== undefined).join('-')}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName as any,
        },
        (payload) => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, queryKey.filter((k) => k !== undefined).join('-'), enableRealtime, query]);

  return query;
}
