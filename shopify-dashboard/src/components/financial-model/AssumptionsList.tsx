import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AssumptionForm, { AssumptionValues } from "./AssumptionForm";
import { Trash2, Pencil } from "lucide-react";

interface AssumptionRow {
  id: string;
  name: string;
  value: number;
  unit: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  category: string | null;
  type: string;
}

export default function AssumptionsList({ type, title }: { type: "revenue" | "cost"; title: string }) {
  const { data = [], isLoading, error, refetch } = useSupabaseQuery<AssumptionRow>(["financial_model_assumptions", type], "financial_model_assumptions", "*", { type });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AssumptionValues | undefined>(undefined);
  const { toast } = useToast();
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financial_model_assumptions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["financial_model_assumptions"] }); toast({ title: "Deleted" }); },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" })
  });

  const openCreate = () => { setEditing(undefined); setOpen(true); };
  const openEdit = (row: AssumptionRow) => {
    setEditing({
      id: row.id,
      name: row.name,
      value: Number(row.value),
      unit: row.unit ?? undefined,
      start_date: row.start_date ? new Date(row.start_date) : undefined,
      end_date: row.end_date ? new Date(row.end_date) : undefined,
      description: row.description ?? undefined,
      category: row.category ?? undefined,
    });
    setOpen(true);
  };

  if (isLoading) return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>Loading...</CardContent></Card>;
  if (error) return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>Error loading.</CardContent></Card>;

  return (
    <Card className="shadow-card-custom">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">{title}</CardTitle>
        <Button onClick={openCreate}>Add</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 && <p className="text-sm text-muted-foreground">No items yet.</p>}
        {data.map((row) => (
          <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-4 font-medium">{row.name}</div>
            <div className="md:col-span-3 text-sm text-muted-foreground">{row.value} {row.unit ?? ""}</div>
            <div className="md:col-span-3 text-xs text-muted-foreground">
              {(row.start_date || row.end_date) ? `${row.start_date ?? ""} → ${row.end_date ?? ""}` : ""}
            </div>
            <div className="md:col-span-2 flex gap-2 justify-end">
              {row.category && <Badge variant="secondary">{row.category}</Badge>}
              <Button size="icon" variant="outline" onClick={() => openEdit(row)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="destructive" onClick={() => del.mutate(row.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        <AssumptionForm open={open} onOpenChange={(o) => { setOpen(o); if (!o) refetch(); }} initial={editing} type={type} />
      </CardContent>
    </Card>
  );
}
