import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBudgetData, BudgetLineItem } from "@/hooks/useBudgetData";
import { 
  TextField, 
  TextAreaField, 
  SelectField, 
  DateField,
  EXPENSE_STATUSES 
} from "./FormFields";

const expenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  due_date: z.date().optional(),
  status: z.enum(["planned", "in_progress", "completed", "paid", "overdue"]),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface UnifiedExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  expense?: BudgetLineItem | null;
  mode: 'create' | 'edit';
}

export const UnifiedExpenseDialog = ({ 
  open, 
  onOpenChange, 
  projectId, 
  expense, 
  mode 
}: UnifiedExpenseDialogProps) => {
  const { createLineItem, updateLineItem } = useBudgetData();
  
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "",
      description: "",
      amount: 0,
      due_date: undefined,
      status: "planned",
    },
  });

  // Reset form when dialog opens or expense changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && expense) {
        form.reset({
          category: expense.category,
          description: expense.description || "",
          amount: expense.planned_amount || expense.actual_amount || 0,
          due_date: expense.due_date ? new Date(expense.due_date) : undefined,
          status: expense.status as any,
        });
      } else {
        form.reset({
          category: "",
          description: "",
          amount: 0,
          due_date: undefined,
          status: "planned",
        });
      }
    }
  }, [open, mode, expense, form]);

  const handleSubmit = async (data: ExpenseFormData) => {
    try {
      if (mode === 'create' && projectId) {
        const lineItemData = {
          project_id: projectId,
          category: data.category,
          description: data.description,
          planned_amount: data.amount,
          actual_amount: data.status === 'paid' ? data.amount : 0,
          due_date: data.due_date?.toISOString().split('T')[0],
          status: data.status,
        };
        await createLineItem(lineItemData);
      } else if (mode === 'edit' && expense) {
        const updatedData = {
          category: data.category,
          description: data.description,
          planned_amount: data.amount,
          actual_amount: data.status === 'paid' ? data.amount : 0,
          due_date: data.due_date?.toISOString().split('T')[0],
          status: data.status,
        };
        await updateLineItem(expense.id, updatedData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} expense:`, error);
    }
  };

  const dialogTitle = mode === 'create' ? 'Add Expense Item' : 'Edit Expense Item';
  const submitButtonText = mode === 'create' ? 'Add Expense' : 'Update Expense';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <TextField
            id="category"
            label="Expense Category"
            form={form}
            required
            placeholder="Enter expense category (e.g., Marketing, Equipment)"
            error={form.formState.errors.category?.message}
          />

          <TextAreaField
            id="description"
            label="Description"
            form={form}
            required
            placeholder="Brief description of the expense"
            error={form.formState.errors.description?.message}
          />

          <TextField
            id="amount"
            label="Amount ($)"
            form={form}
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            error={form.formState.errors.amount?.message}
          />

          <DateField
            id="due_date"
            label="Due Date (Optional)"
            form={form}
            error={form.formState.errors.due_date?.message}
          />

          <SelectField
            id="status"
            label="Status"
            form={form}
            options={EXPENSE_STATUSES}
            required
            error={form.formState.errors.status?.message}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{submitButtonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};