import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface BudgetProject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  total_budget: number;
  start_date?: string;
  end_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetLineItem {
  id: string;
  user_id: string;
  project_id: string;
  category: string;
  description?: string;
  planned_amount: number;
  actual_amount: number;
  due_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  linked_expense_ids?: string[];
}

export const useBudgetData = () => {
  const [projects, setProjects] = useState<BudgetProject[]>([]);
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('budget_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching budget projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch budget projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLineItems = async (projectId?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('budget_line_items')
        .select('*')
        .eq('user_id', user.id);
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure linked_expense_ids is always a string array
      const transformedData = data?.map(item => ({
        ...item,
        linked_expense_ids: Array.isArray(item.linked_expense_ids) 
          ? (item.linked_expense_ids as string[])
          : []
      })) || [];
      
      setLineItems(transformedData);
    } catch (error) {
      console.error('Error fetching budget line items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch budget line items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<BudgetProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('budget_projects')
        .insert([{ ...projectData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Budget project created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating budget project:', error);
      toast({
        title: "Error",
        description: "Failed to create budget project",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<BudgetProject>) => {
    try {
      const { data, error } = await supabase
        .from('budget_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => prev.map(project => project.id === id ? data : project));
      toast({
        title: "Success",
        description: "Budget project updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating budget project:', error);
      toast({
        title: "Error",
        description: "Failed to update budget project",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budget_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => prev.filter(project => project.id !== id));
      toast({
        title: "Success",
        description: "Budget project deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting budget project:', error);
      toast({
        title: "Error",
        description: "Failed to delete budget project",
        variant: "destructive",
      });
    }
  };

  const createLineItem = async (itemData: Omit<BudgetLineItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('budget_line_items')
        .insert([{ ...itemData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = {
        ...data,
        linked_expense_ids: Array.isArray(data.linked_expense_ids) 
          ? (data.linked_expense_ids as string[])
          : []
      } as BudgetLineItem;
      
      setLineItems(prev => [transformedData, ...prev]);
      toast({
        title: "Success",
        description: "Budget line item created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating budget line item:', error);
      toast({
        title: "Error",
        description: "Failed to create budget line item",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateLineItem = async (id: string, updates: Partial<BudgetLineItem>) => {
    try {
      const { data, error } = await supabase
        .from('budget_line_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = {
        ...data,
        linked_expense_ids: Array.isArray(data.linked_expense_ids) 
          ? (data.linked_expense_ids as string[])
          : []
      } as BudgetLineItem;
      
      setLineItems(prev => prev.map(item => item.id === id ? transformedData : item));
      toast({
        title: "Success",
        description: "Budget line item updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating budget line item:', error);
      toast({
        title: "Error",
        description: "Failed to update budget line item",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteLineItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budget_line_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setLineItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Budget line item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting budget line item:', error);
      toast({
        title: "Error",
        description: "Failed to delete budget line item",
        variant: "destructive",
      });
    }
  };

  const linkExpenseToLineItem = async (lineItemId: string, expenseId: string) => {
    try {
      const lineItem = lineItems.find(item => item.id === lineItemId);
      if (!lineItem) return null;

      const existingIds = lineItem.linked_expense_ids || [];
      if (existingIds.includes(expenseId)) return lineItem;

      const updatedIds = [...existingIds, expenseId];
      
      const { data, error } = await supabase
        .from('budget_line_items')
        .update({ linked_expense_ids: updatedIds })
        .eq('id', lineItemId)
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = {
        ...data,
        linked_expense_ids: Array.isArray(data.linked_expense_ids) 
          ? (data.linked_expense_ids as string[])
          : []
      } as BudgetLineItem;
      
      setLineItems(prev => prev.map(item => item.id === lineItemId ? transformedData : item));
      toast({
        title: "Success",
        description: "Expense linked to budget line item",
      });
      
      return data;
    } catch (error) {
      console.error('Error linking expense:', error);
      toast({
        title: "Error",
        description: "Failed to link expense",
        variant: "destructive",
      });
      return null;
    }
  };

  const unlinkExpenseFromLineItem = async (lineItemId: string, expenseId: string) => {
    try {
      const lineItem = lineItems.find(item => item.id === lineItemId);
      if (!lineItem) return null;

      const existingIds = lineItem.linked_expense_ids || [];
      const updatedIds = existingIds.filter(id => id !== expenseId);
      
      const { data, error } = await supabase
        .from('budget_line_items')
        .update({ linked_expense_ids: updatedIds })
        .eq('id', lineItemId)
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = {
        ...data,
        linked_expense_ids: Array.isArray(data.linked_expense_ids) 
          ? (data.linked_expense_ids as string[])
          : []
      } as BudgetLineItem;
      
      setLineItems(prev => prev.map(item => item.id === lineItemId ? transformedData : item));
      toast({
        title: "Success",
        description: "Expense unlinked from budget line item",
      });
      
      return data;
    } catch (error) {
      console.error('Error unlinking expense:', error);
      toast({
        title: "Error",
        description: "Failed to unlink expense",
        variant: "destructive",
      });
      return null;
    }
  };

  const getUnallocatedExpenses = async () => {
    if (!user) return [];
    
    try {
      // Get all financial records of type expense
      const { data: expenses, error } = await supabase
        .from('financial_records')
        .select('*')
        .eq('record_type', 'expense')
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      // Get all linked expense IDs from all line items
      const allLinkedIds = lineItems.flatMap(item => item.linked_expense_ids || []);
      
      // Filter out expenses that are already linked
      const unallocatedExpenses = expenses?.filter(expense => 
        !allLinkedIds.includes(expense.id)
      ) || [];

      return unallocatedExpenses;
    } catch (error) {
      console.error('Error fetching unallocated expenses:', error);
      return [];
    }
  };

  return {
    projects,
    lineItems,
    loading,
    fetchProjects,
    fetchLineItems,
    createProject,
    updateProject,
    deleteProject,
    createLineItem,
    updateLineItem,
    deleteLineItem,
    linkExpenseToLineItem,
    unlinkExpenseFromLineItem,
    getUnallocatedExpenses,
  };
};