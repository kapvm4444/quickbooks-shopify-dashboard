import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, TrendingUp, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BudgetProject, BudgetLineItem } from "@/hooks/useBudgetData";
import { format } from "date-fns";

interface BudgetProjectCardProps {
  project: BudgetProject;
  lineItems: BudgetLineItem[];
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const BudgetProjectCard = ({ 
  project, 
  lineItems, 
  onClick, 
  onEdit, 
  onDelete 
}: BudgetProjectCardProps) => {
  const projectLineItems = lineItems.filter(item => item.project_id === project.id);
  const totalActual = projectLineItems.reduce((sum, item) => sum + item.actual_amount, 0);
  const totalPlanned = projectLineItems.reduce((sum, item) => sum + item.planned_amount, 0);
  const utilization = project.total_budget > 0 ? (totalActual / project.total_budget) * 100 : 0;
  const remaining = project.total_budget - totalActual;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={onClick}>
            <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
            {project.description && (
              <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
            )}
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" onClick={onClick}>
        <div className="space-y-4">
          {/* Budget Overview */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-3 w-3" />
                <span className="text-muted-foreground">Total Budget</span>
              </div>
              <p className="font-semibold">${project.total_budget.toLocaleString()}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-muted-foreground">Spent</span>
              </div>
              <p className="font-semibold">${totalActual.toLocaleString()}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-3 w-3" />
                <span className="text-muted-foreground">Remaining</span>
              </div>
              <p className={`font-semibold ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                ${remaining.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Budget Utilization</span>
              <span>{utilization.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(utilization, 100)} 
              className={`h-2 ${utilization > 90 ? 'text-warning' : ''}`}
            />
          </div>
          
          {/* Timeline */}
          {(project.start_date || project.end_date) && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {project.start_date && (
                <span>Start: {format(new Date(project.start_date), 'MMM dd, yyyy')}</span>
              )}
              {project.end_date && (
                <span>End: {format(new Date(project.end_date), 'MMM dd, yyyy')}</span>
              )}
            </div>
          )}
          
          {/* Line Items Summary */}
          <div className="text-xs text-muted-foreground">
            {projectLineItems.length} line item{projectLineItems.length !== 1 ? 's' : ''}
            {totalPlanned > 0 && (
              <span> • ${totalPlanned.toLocaleString()} planned</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};