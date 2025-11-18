import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MilestoneForm, { MilestoneValues } from "./MilestoneForm";
import { Trash2, Pencil, Target, Check, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Row { 
  id: string; 
  title: string; 
  description: string | null; 
  status: string | null; 
  target_date: string | null; 
  round_id: string | null; 
}

interface FundingRound { 
  id: string; 
  round_type: string; 
  target_amount: number | null; 
  amount_raised: number | null; 
}

interface Investment { 
  round_id: string | null; 
  amount: number | null; 
  status: string | null; 
}

export default function MilestonesList({ roundId }: { roundId: string | null }) {
  const { data: milestones = [], isLoading, error } = useSupabaseQuery<Row>(
    ["funding_milestones", roundId ?? "all"], 
    "funding_milestones", 
    "*", 
    roundId ? { round_id: roundId } : undefined
  );

  const { data: rounds = [] } = useSupabaseQuery<FundingRound>(
    ["funding_rounds_milestones"], 
    "funding_rounds", 
    "*"
  );
  
  const { data: investments = [] } = useSupabaseQuery<Investment>(
    ["funding_round_investments"], 
    "funding_round_investments", 
    "round_id, amount, status"
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MilestoneValues | undefined>(undefined);
  const { toast } = useToast();
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("funding_milestones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["funding_milestones"] }); 
      toast({ title: "Milestone deleted" }); 
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" })
  });

  // Calculate funding progress for each round
  const roundProgress = useMemo(() => {
    const progressMap = new Map<string, { raised: number; target: number; percentage: number }>();
    
    rounds.forEach(round => {
      const target = round.target_amount || 0;
      
      // Calculate actual raised amount from investments
      const roundInvestments = investments.filter(inv => 
        inv.round_id === round.id && 
        (inv.status === 'funded' || inv.status === 'closed')
      );
      const raised = roundInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      
      const percentage = target > 0 ? Math.min((raised / target) * 100, 100) : 0;
      
      progressMap.set(round.id, { raised, target, percentage });
    });
    
    return progressMap;
  }, [rounds, investments]);

  // Group milestones by round - show all rounds with target amounts
  const groupedMilestones = useMemo(() => {
    const groups = new Map<string, { label: string; milestones: Row[]; progress?: { raised: number; target: number; percentage: number } }>();
    
    // When a specific round is selected, only show that round
    if (roundId) {
      const selectedRound = rounds.find(r => r.id === roundId);
      if (selectedRound && selectedRound.target_amount && selectedRound.target_amount > 0) {
        const progress = roundProgress.get(selectedRound.id);
        groups.set(selectedRound.id, {
          label: selectedRound.round_type,
          milestones: [],
          progress
        });
      }
    } else {
      // When no specific round is selected, show all rounds with target amounts
      rounds.forEach(round => {
        if (round.target_amount && round.target_amount > 0) {
          const progress = roundProgress.get(round.id);
          groups.set(round.id, {
            label: round.round_type,
            milestones: [],
            progress
          });
        }
      });
    }
    
    // Add milestones to their respective groups
    milestones.forEach(milestone => {
      if (milestone.round_id && groups.has(milestone.round_id)) {
        const group = groups.get(milestone.round_id);
        if (group) {
          group.milestones.push(milestone);
        }
      }
    });
    
    const result = Array.from(groups.entries()).map(([key, group]) => ({ key, ...group }));
    return result;
  }, [milestones, rounds, roundProgress, roundId]);

  const openCreate = () => { setEditing(undefined); setOpen(true); };
  const openEdit = (row: Row) => {
    setEditing({ 
      id: row.id, 
      title: row.title, 
      description: row.description ?? undefined, 
      status: row.status ?? undefined, 
      target_date: row.target_date ? new Date(row.target_date) : undefined 
    });
    setOpen(true);
  };

  const getStatusBadge = (status: string | null, progress?: { percentage: number }) => {
    const normalizedStatus = (status || "planned").toLowerCase();
    
    if (normalizedStatus === "completed") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <Check className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    
    if (progress && progress.percentage > 0) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
          {Math.round(progress.percentage)}% Complete
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Planned
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  if (isLoading) return (
    <Card className="shadow-card-custom">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-financial-primary" />
          Funding Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>Loading...</CardContent>
    </Card>
  );

  if (error) return (
    <Card className="shadow-card-custom">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-financial-primary" />
          Funding Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>Error loading milestones.</CardContent>
    </Card>
  );

  return (
    <Card className="shadow-card-custom">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-black">
          <Target className="h-5 w-5 text-financial-primary" />
          Funding Milestones
        </CardTitle>
        <Button onClick={openCreate} className="bg-financial-primary text-white hover:bg-financial-primary/90">
          Add Milestone
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedMilestones.length === 0 && (
          <p className="text-sm text-muted-foreground">No milestones yet. Add your first milestone to start tracking progress.</p>
        )}
        
        {groupedMilestones.map((group) => (
          <div key={group.key} className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-lg text-black">{group.label}</h3>
              {group.progress && (
                <p className="text-sm text-muted-foreground mt-1">
                  Target: {formatCurrency(group.progress.target)} • 
                  Raised: {formatCurrency(group.progress.raised)}
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              {group.milestones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No milestones set for this round</p>
                  <Button 
                    variant="outline" 
                    onClick={openCreate}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Milestone
                  </Button>
                </div>
              ) : (
                group.milestones.map((milestone) => {
                const isCompleted = (milestone.status || "").toLowerCase() === "completed";
                const progressValue = isCompleted ? 100 : group.progress?.percentage || 0;
                
                return (
                  <div key={milestone.id} className="rounded-lg border bg-card p-4 animate-fade-in hover-scale">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-black mb-1">{milestone.title}</h4>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {group.progress && (
                          <span className="text-sm font-medium text-black">
                            {formatCurrency(group.progress.raised)} / {formatCurrency(group.progress.target)}
                          </span>
                        )}
                        {getStatusBadge(milestone.status, group.progress)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress 
                        value={progressValue} 
                        className="h-2" 
                      />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {milestone.target_date && `Due: ${new Date(milestone.target_date).toLocaleDateString()}`}
                        </span>
                        <span className="font-medium text-black">
                          {Math.round(progressValue)}% Complete
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end mt-3 pt-3 border-t">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEdit(milestone)}
                        className="text-xs"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => del.mutate(milestone.id)}
                        className="text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
                })
              )}
            </div>
          </div>
        ))}
        
        <MilestoneForm 
          open={open} 
          onOpenChange={(o) => { 
            setOpen(o); 
            if (!o) qc.invalidateQueries({ queryKey: ["funding_milestones"] }); 
          }} 
          initial={editing} 
          roundId={roundId} 
        />
      </CardContent>
    </Card>
  );
}
