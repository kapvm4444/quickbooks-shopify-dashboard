import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Trash2, Pencil, Target, TrendingUp, Users, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoalForm, GoalFormValues } from "./GoalForm";
import { format } from "date-fns";

interface GoalRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  unit: string | null;
  target_value: number | null;
  current_value: number | null;
  progress: number | null;
  due_date: string | null;
  start_date: string | null;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export function GoalsList() {
  const { data = [], isLoading, error, refetch } = useSupabaseQuery<GoalRow>(["goals"], "goals", "*");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GoalFormValues | undefined>(undefined);
  const { toast } = useToast();
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast({ title: "Goal deleted" });
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" })
  });

  const grouped = {
    annual: data.filter((g) => g.category === "annual"),
    quarterly: data.filter((g) => g.category === "quarterly"),
    financial: data.filter((g) => g.category === "financial"),
    growth: data.filter((g) => g.category === "growth"),
    team: data.filter((g) => g.category === "team"),
  };

  const getGoalIcon = (category: string, title: string) => {
    const lowerTitle = title.toLowerCase();
    const lowerCategory = category.toLowerCase();
    
    if (lowerTitle.includes('revenue') || lowerTitle.includes('sales') || lowerCategory.includes('financial')) {
      return DollarSign;
    }
    if (lowerTitle.includes('customer') || lowerTitle.includes('growth') || lowerCategory.includes('growth')) {
      return TrendingUp;
    }
    if (lowerTitle.includes('team') || lowerTitle.includes('hire') || lowerTitle.includes('employee')) {
      return Users;
    }
    if (lowerTitle.includes('market') || lowerTitle.includes('expansion')) {
      return BarChart3;
    }
    return Target;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'on_hold': return 'outline';
      case 'not_started': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'; // Red
      case 'medium': return 'warning'; // Yellow  
      case 'low': return 'success'; // Green
      default: return 'warning';
    }
  };

  const formatStatusText = (status: string) => {
    switch (status) {
      case 'not_started': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'on_hold': return 'On Hold';
      default: return status;
    }
  };

  const calculateProgress = (current: number | null, target: number | null): number => {
    if (!current || !target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getProgressPercentage = (current: number | null, target: number | null): number => {
    if (!current || !target || target === 0) return 0;
    return Math.round((current / target) * 100);
  };

  const formatValue = (current: number | null, target: number | null, unit: string | null) => {
    if (current === null || target === null) return '';
    
    const formatNumber = (num: number) => {
      if (unit === 'currency' || unit === '$') {
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2 
        }).format(num);
      }
      if (unit === 'percentage' || unit === '%') {
        return `${num}%`;
      }
      if (unit) {
        return `${num.toLocaleString()}${unit}`;
      }
      return num.toLocaleString();
    };

    return `${formatNumber(current)} / ${formatNumber(target)}`;
  };

  const getUnitDisplay = (unit: string | null) => {
    if (!unit) return '';
    if (unit === 'currency') return 'USD';
    if (unit === 'percentage') return '%';
    return unit;
  };

  const openEdit = (g: GoalRow) => {
    setEditing({
      id: g.id,
      title: g.title,
      description: g.description ?? undefined,
      category: (g.category as any) ?? undefined,
      unit: g.unit ?? undefined,
      target_value: g.target_value ?? undefined,
      current_value: g.current_value ?? undefined,
      
      due_date: g.due_date ? new Date(g.due_date) : undefined,
      status: (g.status as any) ?? undefined,
      priority: (g.priority as any) ?? undefined,
    });
    setOpen(true);
  };

  if (isLoading) return <div className="flex items-center justify-center py-8">Loading goals...</div>;
  if (error) return <div className="text-destructive">Error loading goals</div>;

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, goals]) => (
        goals.length > 0 && (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold capitalize flex items-center justify-center gap-2 text-center mb-6">
              {category === 'financial' && <DollarSign className="w-5 h-5" />}
              {category === 'growth' && <TrendingUp className="w-5 h-5" />}
              {category === 'quarterly' && <Calendar className="w-5 h-5" />}
              {category === 'annual' && <Target className="w-5 h-5" />}
              {category === 'team' && <Users className="w-5 h-5" />}
              {category} {category === 'quarterly' ? 'Objectives' : 'Goals'}
            </h2>
            
            <div className="space-y-4">
              {goals.map((goal) => {
                const IconComponent = getGoalIcon(category, goal.title);
                const calculatedProgress = calculateProgress(goal.current_value, goal.target_value);
                const progressPercentage = getProgressPercentage(goal.current_value, goal.target_value);
                const valueText = formatValue(goal.current_value, goal.target_value, goal.unit);
                
                return (
                  <Card key={goal.id} className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                           <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1 flex-wrap">
                               <h3 className="font-semibold text-lg">{goal.title}</h3>
                               <Badge variant={getPriorityColor(goal.priority)} className="text-xs">
                                 {goal.priority?.charAt(0).toUpperCase() + goal.priority?.slice(1) || 'Medium'} Priority
                               </Badge>
                               {goal.unit && (
                                 <Badge variant="outline" className="text-xs">
                                   {getUnitDisplay(goal.unit)}
                                 </Badge>
                               )}
                             </div>
                             {goal.description && (
                               <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                             )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(goal)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => del.mutate(goal.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress and Value */}
                      <div className="space-y-2">
                        {valueText && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{valueText}</span>
                          </div>
                        )}
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-muted-foreground">Completion</span>
                           <span className={`font-medium ${progressPercentage > 100 ? 'text-green-600 font-bold' : ''}`}>
                             {progressPercentage}%
                           </span>
                         </div>
                      </div>

                      {/* Progress Bar */}
                       <Progress 
                         value={calculatedProgress} 
                         className={`h-3 ${progressPercentage > 100 ? '[&>div]:bg-green-500' : ''}`} 
                       />

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {goal.start_date && (
                            <span>Started: {format(new Date(goal.start_date), 'MMM yyyy')}</span>
                          )}
                          {goal.due_date && (
                            <span>Due: {format(new Date(goal.due_date), 'MMM yyyy')}</span>
                          )}
                          {!goal.start_date && !goal.due_date && goal.created_at && (
                            <span>Created: {format(new Date(goal.created_at), 'MMM yyyy')}</span>
                          )}
                        </div>
                        <Badge variant={getStatusColor(goal.status)}>
                          {formatStatusText(goal.status)}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )
      ))}

      {Object.values(grouped).every(goals => goals.length === 0) && (
        <Card className="p-8 text-center">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
          <p className="text-muted-foreground mb-4">Start tracking your business objectives by creating your first goal.</p>
        </Card>
      )}

      <GoalForm open={open} onOpenChange={(o) => { setOpen(o); if (!o) refetch(); }} initial={editing} />
    </div>
  );
}
