import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UseOfFundsForm, { UseOfFundsValues } from "./UseOfFundsForm";
import { Trash2, Pencil } from "lucide-react";

interface Row { id: string; category: string; amount: number | null; percentage: number | null; notes: string | null; round_id: string | null; }

interface RoundRow { id: string; round_type: string; date: string | null; }

export default function UseOfFundsList({ roundId }: { roundId: string | null }) {
  const { data = [], isLoading, error, refetch } = useSupabaseQuery<Row>(["use_of_funds", roundId ?? "all"], "use_of_funds", "*", roundId ? { round_id: roundId } : undefined, true);
  const { data: rounds = [] } = useSupabaseQuery<RoundRow>(["funding_rounds"], "funding_rounds", "id, round_type, date");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UseOfFundsValues | undefined>(undefined);
  const { toast } = useToast();
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("use_of_funds").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["use_of_funds"] }); toast({ title: "Deleted" }); },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" })
  });

  const openCreate = () => { setEditing(undefined); setOpen(true); };
  const openEdit = (row: Row) => {
    setEditing({ id: row.id, category: row.category, amount: row.amount ?? undefined, percentage: row.percentage ?? undefined, notes: row.notes ?? undefined });
    setOpen(true);
  };

  if (isLoading) return <Card><CardHeader><CardTitle>Use of Funds</CardTitle></CardHeader><CardContent>Loading...</CardContent></Card>;
  if (error) return <Card><CardHeader><CardTitle>Use of Funds</CardTitle></CardHeader><CardContent>Error loading.</CardContent></Card>;

  const roundLabelById: Record<string, string> = Object.fromEntries(rounds.map(r => [r.id, `${r.round_type}${r.date ? ` • ${r.date}` : ''}`]));

  // Group data by round
  const groupedData = data.reduce((acc, row) => {
    const roundKey = row.round_id || 'unassigned';
    if (!acc[roundKey]) acc[roundKey] = [];
    acc[roundKey].push(row);
    return acc;
  }, {} as Record<string, Row[]>);

  const renderRoundTable = (roundData: Row[], roundId: string | null) => {
    const totalAmount = roundData.reduce((acc, r) => acc + (r.amount ?? 0), 0);
    const hasAnyPercentage = roundData.some((r) => r.percentage != null);
    const totalPercentage = roundData.reduce((acc, r) => acc + (r.percentage ?? 0), 0);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roundData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-sm text-muted-foreground">No items yet.</TableCell>
            </TableRow>
          ) : (
            <>
              {roundData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.category}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{row.amount ? `$${Number(row.amount).toLocaleString()}` : "-"}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{row.percentage ? `${row.percentage}%` : "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <span className="max-w-[40ch] truncate inline-block align-middle" title={row.notes ?? ""}>
                      {row.notes ?? "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="icon" variant="outline" onClick={() => openEdit(row)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="destructive" onClick={() => del.mutate(row.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-semibold">Total</TableCell>
                <TableCell className="text-right font-semibold">{totalAmount ? `$${Number(totalAmount).toLocaleString()}` : "-"}</TableCell>
                <TableCell className="text-right font-semibold">{hasAnyPercentage ? `${totalPercentage}%` : "-"}</TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    );
  };

  // If filtering by specific round, show single table
  if (roundId) {
    return (
      <Card className="shadow-card-custom">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Use of Funds</CardTitle>
          <Button onClick={openCreate}>Add</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {renderRoundTable(data, roundId)}
          <UseOfFundsForm open={open} onOpenChange={(o) => { setOpen(o); if (!o) refetch(); }} initial={editing} roundId={roundId} />
        </CardContent>
      </Card>
    );
  }

  // Show grouped by rounds with accordion
  return (
    <Card className="shadow-card-custom">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Use of Funds</CardTitle>
        <Button onClick={openCreate}>Add</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.keys(groupedData).length === 0 ? (
          <div className="text-sm text-muted-foreground">No items yet.</div>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {Object.entries(groupedData).map(([roundKey, roundData]) => {
              const roundLabel = roundKey === 'unassigned' 
                ? 'Unassigned' 
                : roundLabelById[roundKey] || `Round ${roundKey}`;
              const totalAmount = roundData.reduce((acc, r) => acc + (r.amount ?? 0), 0);
              
              return (
                <AccordionItem key={roundKey} value={roundKey} className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex justify-between items-center w-full pr-4">
                      <span className="font-medium">{roundLabel}</span>
                      <span className="text-sm text-muted-foreground">
                        {roundData.length} items • ${totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {renderRoundTable(roundData, roundKey === 'unassigned' ? null : roundKey)}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
        <UseOfFundsForm open={open} onOpenChange={(o) => { setOpen(o); if (!o) refetch(); }} initial={editing} roundId={roundId} />
      </CardContent>
    </Card>
  );
}
