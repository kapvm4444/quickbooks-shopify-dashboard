export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ap_transactions: {
        Row: {
          amount: number
          attachments: Json | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          status: string
          transaction_date: string
          updated_at: string
          user_id: string
          vendor_id: string | null
          vendor_name: string
        }
        Insert: {
          amount?: number
          attachments?: Json | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          status?: string
          transaction_date?: string
          updated_at?: string
          user_id: string
          vendor_id?: string | null
          vendor_name: string
        }
        Update: {
          amount?: number
          attachments?: Json | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          status?: string
          transaction_date?: string
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ap_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      ar_transactions: {
        Row: {
          amount: number
          created_at: string
          customer_name: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          status: string
          transaction_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          customer_name: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          status?: string
          transaction_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_name?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          status?: string
          transaction_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budget_line_items: {
        Row: {
          actual_amount: number
          category: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          linked_expense_ids: Json | null
          planned_amount: number
          project_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_amount?: number
          category: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          linked_expense_ids?: Json | null
          planned_amount?: number
          project_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_amount?: number
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          linked_expense_ids?: Json | null
          planned_amount?: number
          project_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_line_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "budget_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_projects: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          total_budget: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          total_budget?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          total_budget?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          created_at: string
          id: string
          is_active: boolean
          parent_account_id: string | null
          qbo_detail_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_account_id?: string | null
          qbo_detail_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_account_id?: string | null
          qbo_detail_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      column_mappings: {
        Row: {
          created_at: string
          id: string
          mapping: Json
          name: string
          page_key: string
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mapping: Json
          name: string
          page_key: string
          source_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mapping?: Json
          name?: string
          page_key?: string
          source_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      data_import_diffs: {
        Row: {
          after: Json | null
          before: Json | null
          change_type: string
          created_at: string
          error: string | null
          id: string
          record_external_id: string | null
          run_id: string
        }
        Insert: {
          after?: Json | null
          before?: Json | null
          change_type: string
          created_at?: string
          error?: string | null
          id?: string
          record_external_id?: string | null
          run_id: string
        }
        Update: {
          after?: Json | null
          before?: Json | null
          change_type?: string
          created_at?: string
          error?: string | null
          id?: string
          record_external_id?: string | null
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_import_diffs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "data_import_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      data_import_runs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          page_key: string | null
          records_created: number
          records_updated: number
          source_identifier: string | null
          source_type: string
          started_at: string
          status: string
          summary: Json | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          page_key?: string | null
          records_created?: number
          records_updated?: number
          source_identifier?: string | null
          source_type: string
          started_at?: string
          status?: string
          summary?: Json | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          page_key?: string | null
          records_created?: number
          records_updated?: number
          source_identifier?: string | null
          source_type?: string
          started_at?: string
          status?: string
          summary?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      data_sync_schedules: {
        Row: {
          created_at: string
          cron: string
          enabled: boolean
          id: string
          last_run_at: string | null
          last_status: string | null
          mapping_id: string | null
          next_run_at: string | null
          page_key: string
          source_config: Json
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cron: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          last_status?: string | null
          mapping_id?: string | null
          next_run_at?: string | null
          page_key: string
          source_config: Json
          source_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cron?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          last_status?: string | null
          mapping_id?: string | null
          next_run_at?: string | null
          page_key?: string
          source_config?: Json
          source_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_sync_schedules_mapping_id_fkey"
            columns: ["mapping_id"]
            isOneToOne: false
            referencedRelation: "column_mappings"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sync_sources: {
        Row: {
          config: Json
          created_at: string
          id: string
          last_used_at: string
          page_key: string
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string
          id?: string
          last_used_at?: string
          page_key: string
          source_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          last_used_at?: string
          page_key?: string
          source_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_model_assumptions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          type: string
          unit: string | null
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          type: string
          unit?: string | null
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          type?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      financial_model_key_metrics: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: number | null
          note: string | null
          period: string | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value?: number | null
          note?: string | null
          period?: string | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: number | null
          note?: string | null
          period?: string | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_records: {
        Row: {
          account_name: string | null
          amount: number
          category: string | null
          chart_account_code: string | null
          chart_account_name: string | null
          created_at: string
          description: string
          end_date: string | null
          external_id: string | null
          id: string
          is_recurring: boolean
          metadata: Json | null
          next_due_date: string | null
          payee: string | null
          qb_entity_type: string | null
          record_type: string
          recurrence_day: number | null
          recurrence_pattern: string | null
          recurring_parent_id: string | null
          source: string
          transaction_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name?: string | null
          amount: number
          category?: string | null
          chart_account_code?: string | null
          chart_account_name?: string | null
          created_at?: string
          description: string
          end_date?: string | null
          external_id?: string | null
          id?: string
          is_recurring?: boolean
          metadata?: Json | null
          next_due_date?: string | null
          payee?: string | null
          qb_entity_type?: string | null
          record_type: string
          recurrence_day?: number | null
          recurrence_pattern?: string | null
          recurring_parent_id?: string | null
          source?: string
          transaction_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string | null
          amount?: number
          category?: string | null
          chart_account_code?: string | null
          chart_account_name?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          external_id?: string | null
          id?: string
          is_recurring?: boolean
          metadata?: Json | null
          next_due_date?: string | null
          payee?: string | null
          qb_entity_type?: string | null
          record_type?: string
          recurrence_day?: number | null
          recurrence_pattern?: string | null
          recurring_parent_id?: string | null
          source?: string
          transaction_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_recurring_parent_id_fkey"
            columns: ["recurring_parent_id"]
            isOneToOne: false
            referencedRelation: "financial_records"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_milestones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          round_id: string | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          round_id?: string | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          round_id?: string | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_milestones_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "funding_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_next_steps: {
        Row: {
          created_at: string
          description: string
          due_date: string | null
          id: string
          owner: string | null
          round_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          owner?: string | null
          round_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          owner?: string | null
          round_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_next_steps_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "funding_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_overview: {
        Row: {
          cash_on_hand: number | null
          created_at: string
          id: string
          monthly_burn: number | null
          notes: string | null
          override_active_investors: number | null
          override_current_valuation: number | null
          override_total_raised: number | null
          round_id: string | null
          runway_months: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cash_on_hand?: number | null
          created_at?: string
          id?: string
          monthly_burn?: number | null
          notes?: string | null
          override_active_investors?: number | null
          override_current_valuation?: number | null
          override_total_raised?: number | null
          round_id?: string | null
          runway_months?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cash_on_hand?: number | null
          created_at?: string
          id?: string
          monthly_burn?: number | null
          notes?: string | null
          override_active_investors?: number | null
          override_current_valuation?: number | null
          override_total_raised?: number | null
          round_id?: string | null
          runway_months?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_overview_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "funding_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_round_investments: {
        Row: {
          amount: number
          board_seat: boolean | null
          created_at: string
          currency: string
          description: string | null
          discount: number | null
          id: string
          interest_rate: number | null
          investor_id: string
          liquidation_preference: string | null
          maturity_date: string | null
          notes: string | null
          num_shares: number | null
          other_terms: string | null
          pro_rata_rights: boolean | null
          role: string
          round_id: string
          security_type: string | null
          share_price: number | null
          status: string
          updated_at: string
          user_id: string
          valuation_cap: number | null
        }
        Insert: {
          amount?: number
          board_seat?: boolean | null
          created_at?: string
          currency?: string
          description?: string | null
          discount?: number | null
          id?: string
          interest_rate?: number | null
          investor_id: string
          liquidation_preference?: string | null
          maturity_date?: string | null
          notes?: string | null
          num_shares?: number | null
          other_terms?: string | null
          pro_rata_rights?: boolean | null
          role?: string
          round_id: string
          security_type?: string | null
          share_price?: number | null
          status?: string
          updated_at?: string
          user_id: string
          valuation_cap?: number | null
        }
        Update: {
          amount?: number
          board_seat?: boolean | null
          created_at?: string
          currency?: string
          description?: string | null
          discount?: number | null
          id?: string
          interest_rate?: number | null
          investor_id?: string
          liquidation_preference?: string | null
          maturity_date?: string | null
          notes?: string | null
          num_shares?: number | null
          other_terms?: string | null
          pro_rata_rights?: boolean | null
          role?: string
          round_id?: string
          security_type?: string | null
          share_price?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          valuation_cap?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "funding_round_investments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_stats"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "funding_round_investments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_round_investments_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "funding_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_rounds: {
        Row: {
          amount_raised: number | null
          created_at: string
          date: string | null
          end_date: string | null
          id: string
          lead_investor: string | null
          notes: string | null
          other_investors: string | null
          round_type: string
          start_date: string | null
          status: string | null
          target_amount: number | null
          updated_at: string
          user_id: string
          valuation_post: number | null
          valuation_pre: number | null
        }
        Insert: {
          amount_raised?: number | null
          created_at?: string
          date?: string | null
          end_date?: string | null
          id?: string
          lead_investor?: string | null
          notes?: string | null
          other_investors?: string | null
          round_type: string
          start_date?: string | null
          status?: string | null
          target_amount?: number | null
          updated_at?: string
          user_id: string
          valuation_post?: number | null
          valuation_pre?: number | null
        }
        Update: {
          amount_raised?: number | null
          created_at?: string
          date?: string | null
          end_date?: string | null
          id?: string
          lead_investor?: string | null
          notes?: string | null
          other_investors?: string | null
          round_type?: string
          start_date?: string | null
          status?: string | null
          target_amount?: number | null
          updated_at?: string
          user_id?: string
          valuation_post?: number | null
          valuation_pre?: number | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string | null
          created_at: string
          current_value: number | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          progress: number | null
          status: string
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          progress?: number | null
          status?: string
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          progress?: number | null
          status?: string
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      integration_sync_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          integration_name: string
          last_sync_timestamp: string | null
          records_processed: number | null
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          integration_name: string
          last_sync_timestamp?: string | null
          records_processed?: number | null
          started_at?: string
          status: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          integration_name?: string
          last_sync_timestamp?: string | null
          records_processed?: number | null
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          created_at: string
          current_po_number: string | null
          id: string
          location: string | null
          lot_number: string | null
          notes: string | null
          quantity: number
          reorder_level: number | null
          sku_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_po_number?: string | null
          id?: string
          location?: string | null
          lot_number?: string | null
          notes?: string | null
          quantity?: number
          reorder_level?: number | null
          sku_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_po_number?: string | null
          id?: string
          location?: string | null
          lot_number?: string | null
          notes?: string | null
          quantity?: number
          reorder_level?: number | null
          sku_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          created_at: string
          email: string | null
          firm: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          type: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          firm?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          firm?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      launch_budget_items: {
        Row: {
          actual_amount: number | null
          category: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          item_name: string
          notes: string | null
          planned_amount: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_amount?: number | null
          category: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          item_name: string
          notes?: string | null
          planned_amount?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_amount?: number | null
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          item_name?: string
          notes?: string | null
          planned_amount?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_investors: {
        Row: {
          created_at: string
          email: string | null
          firm: string | null
          id: string
          interest_level: string | null
          name: string
          notes: string | null
          phone: string | null
          round_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          firm?: string | null
          id?: string
          interest_level?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          round_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          firm?: string | null
          id?: string
          interest_level?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          round_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_investors_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "funding_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_insights: {
        Row: {
          affected_skus: Json | null
          created_at: string
          description: string
          id: string
          insight_type: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affected_skus?: Json | null
          created_at?: string
          description: string
          id?: string
          insight_type: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affected_skus?: Json | null
          created_at?: string
          description?: string
          id?: string
          insight_type?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_recommendations: {
        Row: {
          confidence_score: number
          created_at: string
          expected_margin_percent: number | null
          expected_roi: number | null
          id: string
          reasoning: string | null
          recommendation_type: string
          recommended_price: number
          sku_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          expected_margin_percent?: number | null
          expected_roi?: number | null
          id?: string
          reasoning?: string | null
          recommendation_type?: string
          recommended_price: number
          sku_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          expected_margin_percent?: number | null
          expected_roi?: number | null
          id?: string
          reasoning?: string | null
          recommendation_type?: string
          recommended_price?: number
          sku_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_scenarios: {
        Row: {
          created_at: string
          created_from_scenario_id: string | null
          description: string | null
          id: string
          is_ai_generated: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_from_scenario_id?: string | null
          description?: string | null
          id?: string
          is_ai_generated?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_from_scenario_id?: string | null
          description?: string | null
          id?: string
          is_ai_generated?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          email: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_order_line_items: {
        Row: {
          created_at: string
          custom_description: string | null
          id: string
          notes: string | null
          po_id: string
          quantity: number
          sku_id: string | null
          total_cost: number
          unit_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_description?: string | null
          id?: string
          notes?: string | null
          po_id: string
          quantity?: number
          sku_id?: string | null
          total_cost?: number
          unit_cost?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_description?: string | null
          id?: string
          notes?: string | null
          po_id?: string
          quantity?: number
          sku_id?: string | null
          total_cost?: number
          unit_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          attachments: Json | null
          created_at: string
          delivery_date: string | null
          id: string
          items_count: number
          notes: string | null
          order_date: string
          paid_to_date: number
          payment_terms: string | null
          po_number: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string
          vendor_id: string | null
          vendor_name: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          delivery_date?: string | null
          id?: string
          items_count?: number
          notes?: string | null
          order_date: string
          paid_to_date?: number
          payment_terms?: string | null
          po_number: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id: string
          vendor_id?: string | null
          vendor_name: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          delivery_date?: string | null
          id?: string
          items_count?: number
          notes?: string | null
          order_date?: string
          paid_to_date?: number
          payment_terms?: string | null
          po_number?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      quickbooks_connections: {
        Row: {
          access_token: string
          base_url: string
          company_id: string
          company_name: string | null
          connected_at: string
          created_at: string
          environment: string
          id: string
          last_sync_at: string | null
          realm_id: string
          refresh_token: string
          token_expires_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          base_url: string
          company_id: string
          company_name?: string | null
          connected_at?: string
          created_at?: string
          environment?: string
          id?: string
          last_sync_at?: string | null
          realm_id: string
          refresh_token: string
          token_expires_at: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          base_url?: string
          company_id?: string
          company_name?: string | null
          connected_at?: string
          created_at?: string
          environment?: string
          id?: string
          last_sync_at?: string | null
          realm_id?: string
          refresh_token?: string
          token_expires_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      scenario_sku_pricing: {
        Row: {
          created_at: string
          discount_percent: number | null
          id: string
          price: number
          scenario_id: string
          sku_id: string
          updated_at: string
          volume_tier_1_price: number | null
          volume_tier_1_qty: number | null
          volume_tier_2_price: number | null
          volume_tier_2_qty: number | null
          volume_tier_3_price: number | null
          volume_tier_3_qty: number | null
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          id?: string
          price?: number
          scenario_id: string
          sku_id: string
          updated_at?: string
          volume_tier_1_price?: number | null
          volume_tier_1_qty?: number | null
          volume_tier_2_price?: number | null
          volume_tier_2_qty?: number | null
          volume_tier_3_price?: number | null
          volume_tier_3_qty?: number | null
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          id?: string
          price?: number
          scenario_id?: string
          sku_id?: string
          updated_at?: string
          volume_tier_1_price?: number | null
          volume_tier_1_qty?: number | null
          volume_tier_2_price?: number | null
          volume_tier_2_qty?: number | null
          volume_tier_3_price?: number | null
          volume_tier_3_qty?: number | null
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shopify_orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          fulfillment_status: string | null
          id: string
          line_items: Json | null
          order_date: string
          order_number: string
          order_status: string | null
          payment_status: string | null
          shipping_address: Json | null
          shopify_order_id: number
          subtotal_price: number | null
          total_price: number
          total_tax: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          fulfillment_status?: string | null
          id?: string
          line_items?: Json | null
          order_date: string
          order_number: string
          order_status?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shopify_order_id: number
          subtotal_price?: number | null
          total_price: number
          total_tax?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          fulfillment_status?: string | null
          id?: string
          line_items?: Json | null
          order_date?: string
          order_number?: string
          order_status?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shopify_order_id?: number
          subtotal_price?: number | null
          total_price?: number
          total_tax?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sku_cost_details: {
        Row: {
          assembly_cost: number | null
          compliance_cost: number | null
          created_at: string
          duties_customs_cost: number | null
          export_cost: number | null
          id: string
          labor_cost: number | null
          notes: string | null
          other_cost_1: number | null
          other_cost_1_description: string | null
          other_cost_2: number | null
          other_cost_2_description: string | null
          outbound_shipping_cost: number | null
          packaging_cost: number | null
          pick_pack_cost: number | null
          quality_control_cost: number | null
          shipping_cost: number | null
          sku_id: string
          storage_cost: number | null
          target_margin_percent: number | null
          total_landed_cost: number | null
          unit_cost: number | null
          updated_at: string
          user_id: string
          warehousing_cost: number | null
        }
        Insert: {
          assembly_cost?: number | null
          compliance_cost?: number | null
          created_at?: string
          duties_customs_cost?: number | null
          export_cost?: number | null
          id?: string
          labor_cost?: number | null
          notes?: string | null
          other_cost_1?: number | null
          other_cost_1_description?: string | null
          other_cost_2?: number | null
          other_cost_2_description?: string | null
          outbound_shipping_cost?: number | null
          packaging_cost?: number | null
          pick_pack_cost?: number | null
          quality_control_cost?: number | null
          shipping_cost?: number | null
          sku_id: string
          storage_cost?: number | null
          target_margin_percent?: number | null
          total_landed_cost?: number | null
          unit_cost?: number | null
          updated_at?: string
          user_id: string
          warehousing_cost?: number | null
        }
        Update: {
          assembly_cost?: number | null
          compliance_cost?: number | null
          created_at?: string
          duties_customs_cost?: number | null
          export_cost?: number | null
          id?: string
          labor_cost?: number | null
          notes?: string | null
          other_cost_1?: number | null
          other_cost_1_description?: string | null
          other_cost_2?: number | null
          other_cost_2_description?: string | null
          outbound_shipping_cost?: number | null
          packaging_cost?: number | null
          pick_pack_cost?: number | null
          quality_control_cost?: number | null
          shipping_cost?: number | null
          sku_id?: string
          storage_cost?: number | null
          target_margin_percent?: number | null
          total_landed_cost?: number | null
          unit_cost?: number | null
          updated_at?: string
          user_id?: string
          warehousing_cost?: number | null
        }
        Relationships: []
      }
      skus: {
        Row: {
          category: string | null
          cost: number
          created_at: string
          current_po_number: string | null
          id: string
          margin: number | null
          name: string
          price: number
          quantity: number
          sku: string
          status: string
          stock: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cost?: number
          created_at?: string
          current_po_number?: string | null
          id?: string
          margin?: number | null
          name: string
          price?: number
          quantity?: number
          sku: string
          status?: string
          stock?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cost?: number
          created_at?: string
          current_po_number?: string | null
          id?: string
          margin?: number | null
          name?: string
          price?: number
          quantity?: number
          sku?: string
          status?: string
          stock?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_media_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          page_id: string | null
          period_end: string
          period_start: string
          platform: string
          post_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          page_id?: string | null
          period_end: string
          period_start: string
          platform: string
          post_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          page_id?: string | null
          period_end?: string
          period_start?: string
          platform?: string
          post_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      task_audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          task_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          task_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          task_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      task_backups: {
        Row: {
          backup_data: Json
          backup_type: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          backup_data: Json
          backup_type?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          backup_data?: Json
          backup_type?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          author_email: string
          author_name: string
          comment_text: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_email: string
          author_name: string
          comment_text: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_email?: string
          author_name?: string
          comment_text?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_email: string
          assignee_name: string
          attachments: Json | null
          created_at: string
          created_by: string
          created_date: string
          days_open: number
          deleted_at: string | null
          department: string
          description: string
          display_id: number
          due_date: string
          id: string
          is_shared: boolean
          next_steps: string | null
          priority: string
          status: string
          time_limit_hours: number | null
          time_limit_unit: string | null
          timer_completed_at: string | null
          timer_paused_at: string | null
          timer_paused_duration: number | null
          timer_started_at: string | null
          timer_status: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assignee_email: string
          assignee_name: string
          attachments?: Json | null
          created_at?: string
          created_by: string
          created_date?: string
          days_open?: number
          deleted_at?: string | null
          department: string
          description: string
          display_id?: number
          due_date: string
          id?: string
          is_shared?: boolean
          next_steps?: string | null
          priority?: string
          status?: string
          time_limit_hours?: number | null
          time_limit_unit?: string | null
          timer_completed_at?: string | null
          timer_paused_at?: string | null
          timer_paused_duration?: number | null
          timer_started_at?: string | null
          timer_status?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assignee_email?: string
          assignee_name?: string
          attachments?: Json | null
          created_at?: string
          created_by?: string
          created_date?: string
          days_open?: number
          deleted_at?: string | null
          department?: string
          description?: string
          display_id?: number
          due_date?: string
          id?: string
          is_shared?: boolean
          next_steps?: string | null
          priority?: string
          status?: string
          time_limit_hours?: number | null
          time_limit_unit?: string | null
          timer_completed_at?: string | null
          timer_paused_at?: string | null
          timer_paused_duration?: number | null
          timer_started_at?: string | null
          timer_status?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      use_of_funds: {
        Row: {
          amount: number | null
          category: string
          created_at: string
          id: string
          notes: string | null
          percentage: number | null
          round_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          category: string
          created_at?: string
          id?: string
          notes?: string | null
          percentage?: number | null
          round_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          category?: string
          created_at?: string
          id?: string
          notes?: string | null
          percentage?: number | null
          round_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "use_of_funds_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "funding_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contacts: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          id: string
          is_primary: boolean
          name: string
          notes: string | null
          phone: string | null
          role: Database["public"]["Enums"]["vendor_contact_role"]
          title: string | null
          updated_at: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["vendor_contact_role"]
          title?: string | null
          updated_at?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["vendor_contact_role"]
          title?: string | null
          updated_at?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contacts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          category: string | null
          contact_name: string | null
          cost_score: number | null
          created_at: string
          email: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          on_time_delivery: number | null
          overall_score: number | null
          phone: string | null
          quality_score: number | null
          rating: number | null
          status: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          category?: string | null
          contact_name?: string | null
          cost_score?: number | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          on_time_delivery?: number | null
          overall_score?: number | null
          phone?: string | null
          quality_score?: number | null
          rating?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          category?: string | null
          contact_name?: string | null
          cost_score?: number | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          on_time_delivery?: number | null
          overall_score?: number | null
          phone?: string | null
          quality_score?: number | null
          rating?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      website_analytics: {
        Row: {
          created_at: string
          date: string
          dimensions: Json | null
          id: string
          metric_type: string
          metric_value: number
          page_path: string | null
          source: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          dimensions?: Json | null
          id?: string
          metric_type: string
          metric_value: number
          page_path?: string | null
          source: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          dimensions?: Json | null
          id?: string
          metric_type?: string
          metric_value?: number
          page_path?: string | null
          source?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      workbook_uploads: {
        Row: {
          created_at: string
          error_message: string | null
          file_path: string
          filename: string
          id: string
          processing_status: string
          records_created: number | null
          sheets_processed: Json | null
          updated_at: string
          upload_status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_path: string
          filename: string
          id?: string
          processing_status?: string
          records_created?: number | null
          sheets_processed?: Json | null
          updated_at?: string
          upload_status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_path?: string
          filename?: string
          id?: string
          processing_status?: string
          records_created?: number | null
          sheets_processed?: Json | null
          updated_at?: string
          upload_status?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      investor_stats: {
        Row: {
          email: string | null
          estimated_equity_percent: number | null
          firm: string | null
          investments_count: number | null
          investor_id: string | null
          last_investment_at: string | null
          name: string | null
          total_invested: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_actual_from_expenses: {
        Args: { expense_ids: Json }
        Returns: number
      }
      calculate_next_due_date: {
        Args: { base_date: string; day_of_period: number; pattern: string }
        Returns: string
      }
      canonical_round_type: {
        Args: { _t: string }
        Returns: string
      }
      clear_user_expense_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      configure_otp_expiry: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_automatic_backup: {
        Args: { _user_id?: string }
        Returns: undefined
      }
      create_default_chart_of_accounts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_suspicious_activity: {
        Args: { time_window_minutes?: number; user_id_param?: string }
        Returns: {
          event_count: number
          first_event: string
          last_event: string
          suspicious_pattern: string
        }[]
      }
      disconnect_quickbooks_connection: {
        Args: { _id: string }
        Returns: undefined
      }
      enable_leaked_password_protection: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_demo_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_quickbooks_connection_public: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_id: string
          company_name: string
          connected_at: string
          environment: string
          id: string
          last_sync_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      log_security_event: {
        Args: { details?: Json; event_type: string; severity?: string }
        Returns: undefined
      }
      refresh_round_milestones: {
        Args: { _round_id: string }
        Returns: undefined
      }
      update_recurring_expense_due_dates: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      upsert_default_funding_milestones: {
        Args: { _round_id: string }
        Returns: undefined
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
      verify_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          has_authentication_requirement: boolean
          policy_count: number
          table_name: string
        }[]
      }
    }
    Enums: {
      vendor_contact_role:
        | "primary"
        | "billing"
        | "technical"
        | "sales"
        | "support"
        | "procurement"
        | "quality"
        | "logistics"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      vendor_contact_role: [
        "primary",
        "billing",
        "technical",
        "sales",
        "support",
        "procurement",
        "quality",
        "logistics",
        "other",
      ],
    },
  },
} as const
