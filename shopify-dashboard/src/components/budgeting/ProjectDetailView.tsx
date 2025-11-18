import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit2, Plus, Calendar, DollarSign, Target, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { BudgetProject, BudgetLineItem, useBudgetData } from "@/hooks/useBudgetData";
import { useFinancialData } from "@/hooks/useFinancialData";
import { EditProjectDialog } from "./EditProjectDialog";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { ExpensesList } from "./ExpensesList";
import { formatCurrency } from "@/utils/formatters/numberFormatters";

interface ProjectDetailViewProps {
  project: BudgetProject;
  onBack: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "on_hold":
      return "bg-yellow-100 text-yellow-800";
    case "planning":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const ProjectDetailView = ({ project, onBack }: ProjectDetailViewProps) => {
  const { lineItems, fetchLineItems, getUnallocatedExpenses } = useBudgetData();
  const { financialRecords } = useFinancialData();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [unallocatedExpenses, setUnallocatedExpenses] = useState<any[]>([]);
  
  const projectExpenses = lineItems.filter(item => item.project_id === project.id);

  useEffect(() => {
    fetchLineItems(project.id);
    loadUnallocatedExpenses();
  }, [project.id]);

  const loadUnallocatedExpenses = async () => {
    const expenses = await getUnallocatedExpenses();
    setUnallocatedExpenses(expenses);
  };

  // Calculate linked expenses total for each line item
  const lineItemsWithLinkedTotals = projectExpenses.map(item => {
    const linkedExpenses = financialRecords.filter(record => 
      record.record_type === 'expense' && 
      item.linked_expense_ids?.includes(record.id)
    );
    const linkedTotal = linkedExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    
    return {
      ...item,
      actual_amount: linkedTotal
    };
  });

  const totalPlanned = lineItemsWithLinkedTotals.reduce((sum, item) => sum + item.planned_amount, 0);
  const totalActual = lineItemsWithLinkedTotals.reduce((sum, item) => sum + item.actual_amount, 0);
  const utilization = project.total_budget > 0 ? (totalActual / project.total_budget) * 100 : 0;
  const remaining = project.total_budget - totalActual;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Project
          </Button>
          <Button onClick={() => setAddExpenseDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(project.total_budget)}</div>
              <div className="text-xs text-muted-foreground">Project allocation</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planned Expenses</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPlanned)}</div>
              <div className="text-xs text-muted-foreground">
                {totalPlanned > 0 ? `${((totalPlanned / project.total_budget) * 100).toFixed(1)}% of budget` : 'No expenses planned'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actual Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
              <div className="text-xs text-muted-foreground">
                {utilization.toFixed(1)}% of total budget
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
              {remaining >= 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(remaining))}
              </div>
              <div className="text-xs text-muted-foreground">
                {remaining >= 0 ? 'Under budget' : 'Over budget'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Utilization Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Usage</span>
                <span>{utilization.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(utilization, 100)} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
            
            {utilization > 90 && utilization <= 100 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Budget utilization is high. Consider reviewing remaining expenses.
                </span>
              </div>
            )}

            {utilization > 100 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">
                  Budget exceeded by {formatCurrency(Math.abs(remaining))}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unallocated Expenses Warning */}
        {unallocatedExpenses.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Unallocated Expenses ({unallocatedExpenses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700 mb-3">
                You have {unallocatedExpenses.length} expenses that are not assigned to any budget line item. 
                Total unallocated: {formatCurrency(unallocatedExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0))}
              </p>
              <div className="space-y-2">
                {unallocatedExpenses.slice(0, 3).map((expense) => (
                  <div key={expense.id} className="flex justify-between text-sm">
                    <span className="truncate">{expense.description}</span>
                    <span className="font-medium">{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
                {unallocatedExpenses.length > 3 && (
                  <div className="text-xs text-orange-600">
                    ...and {unallocatedExpenses.length - 3} more
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Status and Timeline */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Project Status</p>
                  <p className="text-sm">{project.description}</p>
                </div>
              </div>

              {/* Timeline */}
              {(project.start_date || project.end_date) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Timeline</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    {project.start_date && (
                      <div>
                        <span className="text-muted-foreground">Start:</span>{" "}
                        <span className="font-medium">{format(new Date(project.start_date), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    {project.end_date && (
                      <div>
                        <span className="text-muted-foreground">End:</span>{" "}
                        <span className="font-medium">{format(new Date(project.end_date), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Project Expenses</h2>
          <Button onClick={() => setAddExpenseDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
        
        <ExpensesList expenses={lineItemsWithLinkedTotals} />
      </div>

      {/* Dialogs */}
      <EditProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={project}
      />

      <AddExpenseDialog
        open={addExpenseDialogOpen}
        onOpenChange={setAddExpenseDialogOpen}
        projectId={project.id}
        mode="create"
      />
    </div>
  );
};