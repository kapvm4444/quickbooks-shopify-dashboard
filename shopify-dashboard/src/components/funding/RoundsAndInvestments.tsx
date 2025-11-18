import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RoundForm, { RoundValues } from "./RoundForm";
import RoundInvestmentForm, { RoundInvestmentValues } from "./RoundInvestmentForm";
import { Pencil, Plus, Trash2, Eye } from "lucide-react";
import InvestmentDetailsDialog from "./InvestmentDetailsDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RoundRow {
  id: string;
  round_type: string;
  status: string | null;
  target_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
}

interface InvestmentRow {
  id: string;
  investor_id: string;
  amount: number | null;
  role: string | null;
  status: string | null;
  security_type: string | null;
  other_terms: string | null;
  description: string | null;
  notes: string | null;
  round_id: string | null;
  share_price?: number | null;
  num_shares?: number | null;
  valuation_cap?: number | null;
  discount?: number | null;
  interest_rate?: number | null;
  maturity_date?: string | null;
  pro_rata_rights?: boolean | null;
  board_seat?: boolean | null;
  liquidation_preference?: string | null;
}

interface InvestorRow { id: string; name: string }

export default function RoundsAndInvestments({ selectedRoundId, onSelect }: { selectedRoundId?: string | null, onSelect?: (id: string | null) => void }) {
  const { data: rounds = [], isLoading, error, refetch } = useSupabaseQuery<RoundRow>(
    ["funding_rounds", selectedRoundId ?? "all"],
    "funding_rounds",
    "*",
    selectedRoundId ? { id: selectedRoundId } : undefined,
    true
  );

  const { data: investments = [] } = useSupabaseQuery<InvestmentRow>(
    ["funding_round_investments", selectedRoundId ?? "all"],
    "funding_round_investments",
    "*, share_price, num_shares, valuation_cap, discount, interest_rate, maturity_date, pro_rata_rights, board_seat, liquidation_preference",
    selectedRoundId ? { round_id: selectedRoundId } : undefined,
    true
  );

  const { data: investors = [] } = useSupabaseQuery<InvestorRow>(
    ["investors"],
    "investors",
    "id, name",
  );

  const investorById = useMemo(() => {
    const map = new Map<string, string>();
    investors.forEach((i) => map.set(i.id, i.name));
    return map;
  }, [investors]);

  const investmentsByRound = useMemo(() => {
    const map = new Map<string, InvestmentRow[]>();
    investments.forEach((inv) => {
      const key = inv.round_id ?? "__none";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(inv);
    });
    return map;
  }, [investments]);

  const { toast } = useToast();
  const qc = useQueryClient();

  // Round form state
  const [roundDialogOpen, setRoundDialogOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<RoundValues | undefined>(undefined);

  // Investment form state
  const [invDialogOpen, setInvDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<RoundInvestmentValues | undefined>(undefined);
  const [targetRoundId, setTargetRoundId] = useState<string | null>(null);

  // Investment details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentRow | null>(null);

  // Delete round (safe cascade)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteRoundId, setDeleteRoundId] = useState<string | null>(null);

  const deleteRound = useMutation({
    mutationFn: async (id: string) => {
      // Delete investments first, then round
      const { error: e1 } = await supabase.from("funding_round_investments").delete().eq("round_id", id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("funding_rounds").delete().eq("id", id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["funding_rounds"] });
      qc.invalidateQueries({ queryKey: ["funding_round_investments"] });
      qc.invalidateQueries({ queryKey: ["investor_stats"] });
      qc.invalidateQueries({ queryKey: ["funding_milestones"] });
      toast({ title: "Round deleted" });
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  // Delete investment (no confirm to preserve existing UX)
  const deleteInvestment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("funding_round_investments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["funding_round_investments"] });
      qc.invalidateQueries({ queryKey: ["investor_stats"] });
      qc.invalidateQueries({ queryKey: ["funding_milestones"] });
      toast({ title: "Investment deleted" });
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  const openCreateRound = () => {
    setEditingRound(undefined);
    setRoundDialogOpen(true);
  };

  const openEditRound = (row: RoundRow) => {
    setEditingRound({
      id: row.id,
      round_type: row.round_type,
      status: (row.status as any) ?? undefined,
      target_amount: row.target_amount ?? undefined,
      start_date: row.start_date ? new Date(row.start_date) : undefined,
      end_date: row.end_date ? new Date(row.end_date) : undefined,
      notes: row.notes ?? undefined,
    });
    setRoundDialogOpen(true);
  };

  const openCreateInvestment = (roundId: string) => {
    setTargetRoundId(roundId);
    setEditingInvestment(undefined);
    setInvDialogOpen(true);
  };

  const openEditInvestment = (row: InvestmentRow) => {
    setTargetRoundId(row.round_id ?? null);
    setEditingInvestment({
      id: row.id,
      investor_id: row.investor_id,
      amount: row.amount ?? 0,
      role: (row.role as any) ?? "participant",
      status: (row.status as any) ?? "funded",
      security_type: row.security_type ?? undefined,
      other_terms: row.other_terms ?? undefined,
      description: row.description ?? undefined,
      notes: row.notes ?? undefined,
    } as any);
    setInvDialogOpen(true);
  };

  const formatCurrency = (n?: number | null) => (n == null ? "-" : `$${Number(n).toLocaleString()}`);
  const formatDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : "-");

  // Parse other_terms JSON to get selected terms for display
  const parseTermsForDisplay = (termsJson: string | null, investment: InvestmentRow) => {
    const terms: string[] = [];
    
    // Add financial terms with values
    if (investment.valuation_cap) terms.push(`Cap: ${formatCurrency(investment.valuation_cap)}`);
    if (investment.discount) terms.push(`Discount: ${investment.discount}%`);
    if (investment.interest_rate) terms.push(`Interest: ${investment.interest_rate}%`);
    if (investment.maturity_date) terms.push(`Maturity: ${formatDate(investment.maturity_date)}`);
    
    // Add boolean terms
    if (investment.pro_rata_rights) terms.push("Pro-Rata");
    if (investment.board_seat) terms.push("Board Seat");
    
    // Add other selected terms from JSON
    if (termsJson) {
      try {
        const parsed = JSON.parse(termsJson);
        if (Array.isArray(parsed)) {
          terms.push(...parsed.slice(0, 3)); // Limit to first 3 for display
        }
      } catch {
        // Ignore parsing errors
      }
    }
    
    return terms;
  };

  const openInvestmentDetails = (investment: InvestmentRow) => {
    setSelectedInvestment(investment);
    setDetailsDialogOpen(true);
  };

  if (isLoading) return <Card><CardHeader><CardTitle>Funding Rounds & Investments</CardTitle></CardHeader><CardContent>Loading...</CardContent></Card>;
  if (error) return <Card><CardHeader><CardTitle>Funding Rounds & Investments</CardTitle></CardHeader><CardContent>Error loading.</CardContent></Card>;

  return (
    <Card className="shadow-card-custom">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Funding Rounds & Investments</CardTitle>
        <Button onClick={openCreateRound}>Add Round</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {rounds.length === 0 && (
          <p className="text-sm text-muted-foreground">No rounds yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rounds.map((row) => {
            const invs = investmentsByRound.get(row.id) ?? [];
            return (
              <Card key={row.id} className="border shadow-card-custom">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="cursor-pointer" onClick={() => onSelect?.(row.id)}>
                      {row.round_type}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {row.status && <Badge variant="secondary" className="capitalize">{row.status}</Badge>}
                      <Button size="icon" variant="outline" onClick={() => openEditRound(row)} aria-label="Edit round">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="destructive" onClick={() => setDeleteRoundId(row.id)} aria-label="Delete round">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this round?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the round and its investments. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                if (deleteRoundId) deleteRound.mutate(deleteRoundId);
                                setDeleteRoundId(null);
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Target Amount</div>
                      <div className="font-medium">{formatCurrency(row.target_amount)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Start Date</div>
                      <div className="font-medium">{formatDate(row.start_date)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">End Date</div>
                      <div className="font-medium">{formatDate(row.end_date)}</div>
                    </div>
                  </div>

                  {row.notes && (
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-1">Notes</div>
                      <div className="whitespace-pre-wrap">{row.notes}</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="font-medium">Investments</div>
                    <Button size="sm" onClick={() => openCreateInvestment(row.id)}>
                      <Plus className="h-4 w-4 mr-1" /> Add Investment
                    </Button>
                  </div>

                  {invs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No investments yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Investor</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Security</TableHead>
                            <TableHead>Terms</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invs.map((inv) => (
                            <TableRow key={inv.id}>
                              <TableCell className="font-medium">{investorById.get(inv.investor_id) ?? "Unknown investor"}</TableCell>
                              <TableCell className="text-right">{formatCurrency(inv.amount)}</TableCell>
                              <TableCell className="capitalize">{inv.role ?? "participant"}</TableCell>
                              <TableCell className="capitalize">{inv.status ?? "funded"}</TableCell>
                              <TableCell>{inv.security_type ?? "-"}</TableCell>
                               <TableCell className="max-w-[300px]">
                                 {(() => {
                                   const terms = parseTermsForDisplay(inv.other_terms, inv);
                                   if (terms.length === 0) return "-";
                                   
                                   return (
                                     <div className="space-y-1">
                                       <div className="flex flex-wrap gap-1">
                                         {terms.slice(0, 2).map((term, index) => (
                                           <Badge key={index} variant="outline" className="text-xs">
                                             {term}
                                           </Badge>
                                         ))}
                                         {terms.length > 2 && (
                                           <Badge variant="secondary" className="text-xs">
                                             +{terms.length - 2} more
                                           </Badge>
                                         )}
                                       </div>
                                     </div>
                                   );
                                 })()}
                               </TableCell>
                               <TableCell className="text-right">
                                 <div className="flex gap-1 justify-end">
                                   <Button 
                                     size="icon" 
                                     variant="ghost" 
                                     onClick={() => openInvestmentDetails(inv)} 
                                     aria-label="View investment details"
                                     className="h-8 w-8"
                                   >
                                     <Eye className="h-4 w-4" />
                                   </Button>
                                   <Button 
                                     size="icon" 
                                     variant="outline" 
                                     onClick={() => openEditInvestment(inv)} 
                                     aria-label="Edit investment"
                                     className="h-8 w-8"
                                   >
                                     <Pencil className="h-4 w-4" />
                                   </Button>
                                   <Button 
                                     size="icon" 
                                     variant="destructive" 
                                     onClick={() => deleteInvestment.mutate(inv.id)} 
                                     aria-label="Delete investment"
                                     className="h-8 w-8"
                                   >
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                                 </div>
                               </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Forms */}
        <RoundForm
          open={roundDialogOpen}
          onOpenChange={(o) => { setRoundDialogOpen(o); if (!o) { refetch(); qc.invalidateQueries({ queryKey: ["investor_stats"] }); qc.invalidateQueries({ queryKey: ["funding_milestones"] }); } }}
          initial={editingRound}
        />

        <RoundInvestmentForm
          open={invDialogOpen}
          onOpenChange={(o) => { setInvDialogOpen(o); if (!o) { qc.invalidateQueries({ queryKey: ["funding_round_investments"] }); qc.invalidateQueries({ queryKey: ["investor_stats"] }); qc.invalidateQueries({ queryKey: ["funding_milestones"] }); } }}
          initial={editingInvestment}
          roundId={targetRoundId}
        />

        {selectedInvestment && (
          <InvestmentDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            investment={selectedInvestment}
            investorName={investorById.get(selectedInvestment.investor_id) ?? "Unknown investor"}
          />
        )}
      </CardContent>
    </Card>
  );
}
