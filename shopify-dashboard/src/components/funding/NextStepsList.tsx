import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import NextStepForm, { NextStepValues } from "./NextStepForm";
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Shield, 
  CheckCircle, 
  BarChart, 
  Users, 
  Search, 
  ClipboardCheck, 
  CheckSquare,
  Plus
} from "lucide-react";

interface Row { id: string; description: string; owner: string | null; due_date: string | null; status: string | null; round_id: string | null; }

// Smart icon selection based on step content
const getStepIcon = (description: string) => {
  const desc = description.toLowerCase();
  
  if (desc.includes('financial') || desc.includes('funding') || desc.includes('investment') || desc.includes('revenue') || desc.includes('budget')) {
    return DollarSign;
  }
  if (desc.includes('legal') || desc.includes('compliance') || desc.includes('contract') || desc.includes('agreement')) {
    return Shield;
  }
  if (desc.includes('due diligence') || desc.includes('review') || desc.includes('audit') || desc.includes('research')) {
    return Search;
  }
  if (desc.includes('growth') || desc.includes('metrics') || desc.includes('analytics') || desc.includes('performance')) {
    return TrendingUp;
  }
  if (desc.includes('team') || desc.includes('hire') || desc.includes('recruiting') || desc.includes('staff')) {
    return Users;
  }
  if (desc.includes('document') || desc.includes('report') || desc.includes('presentation') || desc.includes('proposal')) {
    return FileText;
  }
  if (desc.includes('target') || desc.includes('goal') || desc.includes('milestone') || desc.includes('objective')) {
    return Target;
  }
  if (desc.includes('chart') || desc.includes('data') || desc.includes('analysis') || desc.includes('dashboard')) {
    return BarChart;
  }
  if (desc.includes('complete') || desc.includes('finish') || desc.includes('done') || desc.includes('check')) {
    return CheckCircle;
  }
  if (desc.includes('checklist') || desc.includes('list') || desc.includes('items') || desc.includes('tasks')) {
    return ClipboardCheck;
  }
  
  return CheckSquare; // Default fallback
};

export default function NextStepsList({ roundId }: { roundId: string | null }) {
  const { data = [], isLoading, error, refetch } = useSupabaseQuery<Row>(["funding_next_steps", roundId ?? "all"], "funding_next_steps", "*", roundId ? { round_id: roundId } : undefined);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NextStepValues | undefined>(undefined);
  const { toast } = useToast();
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("funding_next_steps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["funding_next_steps"] }); toast({ title: "Deleted" }); },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" })
  });

  const openCreate = () => { setEditing(undefined); setOpen(true); };
  const openEdit = (row: Row) => {
    setEditing({ id: row.id, description: row.description, owner: row.owner ?? undefined, status: row.status ?? undefined, due_date: row.due_date ? new Date(row.due_date) : undefined });
    setOpen(true);
  };

  if (isLoading) return <Card><CardHeader><CardTitle>Next Steps</CardTitle></CardHeader><CardContent>Loading...</CardContent></Card>;
  if (error) return <Card><CardHeader><CardTitle>Next Steps</CardTitle></CardHeader><CardContent>Error loading.</CardContent></Card>;

  return (
    <Card className="shadow-card-custom">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="flex items-center gap-2 text-foreground text-lg font-semibold">
          <CheckSquare className="h-5 w-5 text-primary" />
          Next Steps
        </CardTitle>
        <Button 
          onClick={openCreate} 
          size="sm"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Step
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No next steps yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Add your first step to get started</p>
          </div>
        )}
        {data.map((row) => {
          const IconComponent = getStepIcon(row.description);
          return (
            <div 
              key={row.id} 
              className="group flex items-start gap-3 p-3 rounded-lg bg-card/50 hover:bg-card hover:shadow-sm transition-all duration-200 cursor-pointer border-0 hover:border border-border/20 animate-fade-in"
              onClick={() => openEdit(row)}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground text-sm leading-relaxed mb-1 group-hover:text-primary transition-colors">
                  {row.description}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {row.owner && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {row.owner}
                    </span>
                  )}
                  {row.due_date && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {new Date(row.due_date).toLocaleDateString()}
                    </span>
                  )}
                  {row.status && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                    }`}>
                      {row.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <NextStepForm open={open} onOpenChange={(o) => { setOpen(o); if (!o) refetch(); }} initial={editing} roundId={roundId} />
      </CardContent>
    </Card>
  );
}
