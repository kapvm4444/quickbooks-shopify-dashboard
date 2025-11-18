
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LeadInvestorForm, { LeadInvestorValues } from "./LeadInvestorForm";
import { Trash2, Pencil, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { normalizeStatus } from "@/components/funding/statusColors";

interface Row { id: string; name: string; firm: string | null; email: string | null; phone: string | null; notes: string | null; interest_level: string | null; round_id: string | null; }

// Stats from the view
interface InvestorStat {
  investor_id: string;
  name: string | null;
  firm: string | null;
  email: string | null;
  total_invested: number | null;
  estimated_equity_percent: number | null;
  investments_count: number | null;
  last_investment_at: string | null;
}

// New: lightweight investment row for per-status breakdown
interface InvestmentRow {
  id: string;
  investor_id: string;
  amount: number | null;
  status: string | null;
  round_id: string | null;
}

export default function LeadInvestorsList({ roundId }: { roundId: string | null }) {
  const { data = [], isLoading, error, refetch } = useSupabaseQuery<Row>(["lead_investors", roundId ?? "all"], "lead_investors", "*", roundId ? { round_id: roundId } : undefined);
  const { data: stats = [], refetch: refetchStats } = useSupabaseQuery<InvestorStat>(["investor_stats"], "investor_stats", "*", undefined, false);

  // New: fetch investments to compute per-status amounts
  const { data: invs = [] } = useSupabaseQuery<InvestmentRow>(
    ["funding_round_investments", roundId ?? "all"],
    "funding_round_investments",
    "id, investor_id, amount, status, round_id",
    roundId ? { round_id: roundId } : undefined,
    true
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LeadInvestorValues | undefined>(undefined);
  const { toast } = useToast();
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lead_investors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lead_investors"] }); toast({ title: "Deleted" }); },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" })
  });

  const openCreate = () => { setEditing(undefined); setOpen(true); };
  const openEdit = (row: Row) => {
    setEditing({ id: row.id, name: row.name, firm: row.firm ?? undefined, email: row.email ?? undefined, phone: row.phone ?? undefined, notes: row.notes ?? undefined, interest_level: row.interest_level ?? undefined });
    setOpen(true);
  };

  const statsByEmail = useMemo(() => {
    const map = new Map<string, InvestorStat>();
    stats.forEach(s => {
      if (s.email) map.set(s.email.toLowerCase(), s);
    });
    return map;
  }, [stats]);

  const statsByName = useMemo(() => {
    const map = new Map<string, InvestorStat>();
    stats.forEach(s => {
      if (s.name) map.set(s.name.toLowerCase(), s);
    });
    return map;
  }, [stats]);

  // Build a quick lookup investor_id by email/name using stats
  const investorIdByEmail = useMemo(() => {
    const map = new Map<string, string>();
    stats.forEach(s => {
      if (s.email && s.investor_id) map.set(s.email.toLowerCase(), s.investor_id);
    });
    return map;
  }, [stats]);

  const investorIdByName = useMemo(() => {
    const map = new Map<string, string>();
    stats.forEach(s => {
      if (s.name && s.investor_id) map.set(s.name.toLowerCase(), s.investor_id);
    });
    return map;
  }, [stats]);

  const statsById = useMemo(() => {
    const map = new Map<string, InvestorStat>();
    stats.forEach((s) => {
      if (s.investor_id) map.set(s.investor_id, s);
    });
    return map;
  }, [stats]);

  type CombinedRow = {
    key: string;
    source: 'lead' | 'inv';
    investorId?: string;
    display: { name: string; firm?: string | null; email?: string | null };
    lead?: Row;
  };

  const combinedRows = useMemo<CombinedRow[]>(() => {
    const map = new Map<string, CombinedRow>();

    // Seed from lead_investors
    for (const row of data) {
      const investorId = (row.email && investorIdByEmail.get(row.email.toLowerCase())) || investorIdByName.get(row.name.toLowerCase());
      const key = investorId ?? `lead-${row.id}`;
      map.set(key, {
        key,
        source: 'lead',
        investorId: investorId ?? undefined,
        display: { name: row.name, firm: row.firm, email: row.email ?? undefined },
        lead: row,
      });
    }

    // Add any investors present via investments for this round
    for (const inv of invs) {
      if (!inv.investor_id) continue;
      const id = inv.investor_id;
      if (map.has(id)) continue; // already included via lead row
      const s = statsById.get(id);
      const name = s?.name ?? 'Investor';
      const firm = s?.firm ?? null;
      const email = s?.email ?? null;
      map.set(id, {
        key: id,
        source: 'inv',
        investorId: id,
        display: { name, firm, email: email ?? undefined },
      });
    }

    return Array.from(map.values());
  }, [data, invs, investorIdByEmail, investorIdByName, statsById]);

  const formatCurrency = (n?: number | null) => {
    if (n == null) return "—";
    return `$${Number(n).toLocaleString()}`;
  };

  // Helper to sum amounts by normalized status for a given investor id
  const getStatusSums = (investorId?: string) => {
    let proposed = 0, committed = 0, closed = 0;
    if (!investorId) return { proposed, committed, closed };
    for (const inv of invs) {
      if (inv.investor_id !== investorId) continue;
      const amt = Number(inv.amount ?? 0);
      const s = normalizeStatus(inv.status);
      if (s === 'pending') proposed += amt;
      else if (s === 'funded') committed += amt;
      else if (s === 'closed') closed += amt; // includes 'received'
    }
    return { proposed, committed, closed };
  };

  if (isLoading) return <Card><CardHeader><CardTitle>Investors</CardTitle></CardHeader><CardContent>Loading...</CardContent></Card>;
  if (error) return <Card><CardHeader><CardTitle>Investors</CardTitle></CardHeader><CardContent>Error loading.</CardContent></Card>;

  return (
    <Card className="shadow-card-custom">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-black">
          <Users className="h-5 w-5 text-financial-primary" />
          Investors
        </CardTitle>
        <Button onClick={openCreate} className="bg-financial-primary text-white hover:bg-financial-primary/90">
          Add Investor
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {combinedRows.length === 0 && <p className="text-sm text-muted-foreground">No investors yet.</p>}
        {combinedRows.map((item) => {
          const investorId = item.investorId;
          const sums = getStatusSums(investorId);
          const total = sums.proposed + sums.committed + sums.closed;

          let equityPct: number | null = null;
          if (investorId) {
            const st = statsById.get(investorId);
            equityPct = st?.estimated_equity_percent != null ? Math.max(0, Math.min(100, Number(st.estimated_equity_percent))) : null;
          } else {
            const st =
              (item.display.email && statsByEmail.get(item.display.email.toLowerCase())) ||
              (item.display.name && statsByName.get(item.display.name.toLowerCase()));
            equityPct = st?.estimated_equity_percent != null ? Math.max(0, Math.min(100, Number(st.estimated_equity_percent))) : null;
          }

          return (
            <div key={item.key} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-4 font-medium">{item.display.name}</div>
              <div className="md:col-span-4 text-sm text-muted-foreground">
                {item.display.firm ?? item.display.email ?? ""}
                <div className="mt-1 text-xs space-y-1">
                  <div className="grid grid-cols-5 gap-2">
                    <span className="text-muted-foreground col-span-2">Total</span>
                    <span className="font-medium col-span-3">{formatCurrency(total)}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 items-center">
                    <span className="text-muted-foreground col-span-2">Equity</span>
                    <span className="col-span-3">{equityPct != null ? `${equityPct.toFixed(2)}%` : "—"}</span>
                  </div>
                  {equityPct != null && <Progress value={equityPct} className="h-1" />}

                  {/* Status breakdown */}
                  <div className="grid grid-cols-5 gap-2">
                    <span className="text-muted-foreground col-span-2">Pending</span>
                    <span className="col-span-3">{formatCurrency(sums.proposed)}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <span className="text-muted-foreground col-span-2">Funded</span>
                    <span className="col-span-3">{formatCurrency(sums.committed)}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <span className="text-muted-foreground col-span-2">Closed</span>
                    <span className="col-span-3">{formatCurrency(sums.closed)}</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 flex gap-2 justify-end">
                {item.source === 'lead' && item.lead && (
                  <>
                    <Button size="icon" variant="outline" onClick={() => openEdit(item.lead!)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="destructive" onClick={() => del.mutate(item.lead!.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <LeadInvestorForm open={open} onOpenChange={(o) => { setOpen(o); if (!o) { refetch(); refetchStats(); } }} initial={editing} roundId={roundId} />
      </CardContent>
    </Card>
  );
}
