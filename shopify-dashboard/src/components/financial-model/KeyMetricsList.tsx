import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import KeyMetricForm, { MetricValues } from "./KeyMetricForm";
import { Trash2, Pencil } from "lucide-react";

interface MetricRow {
  id: string;
  metric_name: string;
  metric_value: number | null;
  unit: string | null;
  period: string | null;
  note: string | null;
}

export default function KeyMetricsList() {
  const { data = [], isLoading, error, refetch } = useSupabaseQuery<MetricRow>(["financial_model_key_metrics"], "financial_model_key_metrics");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MetricValues | undefined>(undefined);
  const { toast } = useToast();
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financial_model_key_metrics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["financial_model_key_metrics"] }); toast({ title: "Deleted" }); },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" })
  });

  const openCreate = () => { setEditing(undefined); setOpen(true); };
  const openEdit = (row: MetricRow) => {
    setEditing({
      id: row.id,
      metric_name: row.metric_name,
      metric_value: Number(row.metric_value ?? 0),
      unit: row.unit ?? undefined,
      period: row.period ?? undefined,
      note: row.note ?? undefined,
    });
    setOpen(true);
  };

  if (isLoading) return <Card><CardHeader><CardTitle>Key Metrics</CardTitle></CardHeader><CardContent>Loading...</CardContent></Card>;
  if (error) return <Card><CardHeader><CardTitle>Key Metrics</CardTitle></CardHeader><CardContent>Error loading.</CardContent></Card>;

  return (
    <Card className="shadow-card-custom">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Key Metrics</CardTitle>
        <Button onClick={openCreate}>Add</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 && <p className="text-sm text-muted-foreground">No metrics yet.</p>}
        {data.map((row) => (
          <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-4 font-medium">{row.metric_name}</div>
            <div className="md:col-span-3 text-sm text-muted-foreground">{row.metric_value} {row.unit ?? ""}</div>
            <div className="md:col-span-3 text-xs text-muted-foreground">{row.period ?? ""}</div>
            <div className="md:col-span-2 flex gap-2 justify-end">
              {row.note && <Badge variant="secondary">Note</Badge>}
              <Button size="icon" variant="outline" onClick={() => openEdit(row)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="destructive" onClick={() => del.mutate(row.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        <KeyMetricForm open={open} onOpenChange={(o) => { setOpen(o); if (!o) refetch(); }} initial={editing} />
      </CardContent>
    </Card>
  );
}
