import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit2, Trash2, Link, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { BudgetLineItem, useBudgetData } from "@/hooks/useBudgetData";
import { EditExpenseDialog } from "./EditExpenseDialog";
import { ExpenseAssignmentDialog } from "./ExpenseAssignmentDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ExpensesListProps {
  expenses: BudgetLineItem[];
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "default";
    case "in_progress":
      return "secondary";
    case "overdue":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-600";
    case "in_progress":
      return "text-blue-600";
    case "overdue":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export const ExpensesList = ({ expenses }: ExpensesListProps) => {
  const { deleteLineItem } = useBudgetData();
  const [editExpense, setEditExpense] = useState<BudgetLineItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [assignmentExpense, setAssignmentExpense] = useState<BudgetLineItem | null>(null);

  const handleDeleteExpense = async () => {
    if (selectedExpenseId) {
      await deleteLineItem(selectedExpenseId);
      setDeleteDialogOpen(false);
      setSelectedExpenseId(null);
    }
  };

  const totalPlanned = expenses.reduce((sum, expense) => sum + expense.planned_amount, 0);
  const totalActual = expenses.reduce((sum, expense) => sum + expense.actual_amount, 0);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No expenses added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-4 border">
          <p className="text-sm text-muted-foreground">Total Planned</p>
          <p className="text-2xl font-bold">${totalPlanned.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <p className="text-sm text-muted-foreground">Total Actual</p>
          <p className="text-2xl font-bold">${totalActual.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <p className="text-sm text-muted-foreground">Variance</p>
          <p className={`text-2xl font-bold ${totalActual > totalPlanned ? 'text-red-600' : 'text-green-600'}`}>
            ${Math.abs(totalActual - totalPlanned).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Planned</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.category}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {expense.description || "—"}
                </TableCell>
                <TableCell className="text-right">
                  ${expense.planned_amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium">
                      ${expense.actual_amount.toLocaleString()}
                    </span>
                    {expense.linked_expense_ids && expense.linked_expense_ids.length > 0 ? (
                      <div title="Expenses linked">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div title="No expenses linked">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {expense.due_date ? format(new Date(expense.due_date), "MMM dd, yyyy") : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(expense.status)} className={getStatusColor(expense.status)}>
                    {expense.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAssignmentExpense(expense);
                        }}
                      >
                        <Link className="mr-2 h-4 w-4" />
                        Assign Expenses
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditExpense(expense)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedExpenseId(expense.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Expense Assignment Dialog */}
      {assignmentExpense && (
        <ExpenseAssignmentDialog 
          lineItem={assignmentExpense}
          onClose={() => setAssignmentExpense(null)}
        >
          <div />
        </ExpenseAssignmentDialog>
      )}

      {/* Edit Expense Dialog */}
      <EditExpenseDialog
        open={!!editExpense}
        onOpenChange={(open) => !open && setEditExpense(null)}
        expense={editExpense}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExpense} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};