
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import InvestorQuickCreate from "./InvestorQuickCreate";

const Schema = z.object({
  id: z.string().optional(),
  investor_id: z.string().optional(),
  investor_name: z.string().optional(),
  round_id: z.string().optional(),
  round_label: z.string().optional(),
  amount: z.coerce.number().min(0, "Amount must be >= 0"),
  role: z.enum(["lead", "co-lead", "participant"]).default("participant").optional(),
  status: z.enum(["pending", "funded", "closed"]).default("funded").optional(),
  security_type: z.string().optional(),
  // Key term columns (optional)
  valuation_cap: z.number().optional(),
  discount: z.number().optional(),
  interest_rate: z.number().optional(),
  maturity_date: z.string().optional(),
  liquidation_preference: z.string().optional(),
  pro_rata_rights: z.boolean().optional(),
  board_seat: z.boolean().optional(),
  // UI helpers
  selected_terms: z.array(z.string()).optional(),
  terms_values: z.record(z.any()).optional(),
  other_terms: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export type RoundInvestmentValues = z.infer<typeof Schema>;

interface InvestorRow {
  id: string;
  name: string;
  email?: string | null;
  firm?: string | null;
}

interface LeadInvestorRow {
  id: string;
  name: string;
  email?: string | null;
  firm?: string | null;
  round_id?: string | null;
}

export default function RoundInvestmentForm({
  open,
  onOpenChange,
  initial,
  roundId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: RoundInvestmentValues;
  roundId: string | null;
}) {
  const form = useForm<RoundInvestmentValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      ...initial,
      selected_terms: [],
      terms_values: {},
    },
  });
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [amountDisplay, setAmountDisplay] = useState<string>("");


// Helpers for amount formatting
const formatAmount = (n: number) =>
  isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "";
const parseAmount = (s: string) => {
  const cleaned = s.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Security types per spec
const SECURITY_TYPES = [
  "Common Equity",
  "Preferred Equity",
  "Convertible Note",
  "SAFE (Simple Agreement for Future Equity)",
  "Revenue-Based Financing",
  "Royalty Financing",
  "Venture Debt",
  "Bank Loan",
  "Line of Credit",
  "Invoice Financing / Factoring",
  "Grant / Non-Dilutive Funding",
] as const;

// Terms per spec (labels)
const TERM_OPTIONS = [
  "Valuation Cap",
  "Discount Rate",
  "Interest Rate",
  "Maturity Date",
  "Liquidation Preference",
  "Anti-Dilution Protection",
  "Dividend Rate",
  "Warrant Coverage",
  "Revenue Share %",
  "Royalty Rate",
  "Prepayment Penalty",
  "Financial Covenants",
  "Board Seat / Observer Rights",
  "Pro-Rata Rights",
  "Information Rights",
  "Right of First Refusal / Co-Sale",
  "Drag-Along / Tag-Along",
] as const;

const DIRECT_TERM_KEYS = new Set([
  "Valuation Cap",
  "Discount Rate",
  "Interest Rate",
  "Maturity Date",
  "Liquidation Preference",
  "Pro-Rata Rights",
  "Board Seat / Observer Rights",
]);

function LabelWithHelp({ label, help }: { label: string; help: string }) {
  return (
    <div className="flex items-center gap-1">
      <span>{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label={`Help: ${label}`} className="text-muted-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">{help}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

const { data: investors = [] } = useSupabaseQuery<InvestorRow>(
  ["investors"],
  "investors",
  "id, name, email, firm",
  undefined,
  false
);

  const { data: leadInvestors = [] } = useSupabaseQuery<LeadInvestorRow>(
    ["lead_investors", roundId ?? "all"],
    "lead_investors",
    "id, name, email, firm, round_id",
    roundId ? { round_id: roundId } : undefined,
    false
  );

  const dedupLeadInvestors = useMemo(() => {
    const emails = new Set<string>();
    const names = new Set<string>();
    investors.forEach((i) => {
      const nm = (i?.name ?? "").toLowerCase().trim();
      if (nm) names.add(nm);
      const em = (i?.email ?? "").toLowerCase().trim();
      if (em) emails.add(em);
    });
    return leadInvestors.filter((l) => {
      const em = (l?.email ?? "").toLowerCase().trim();
      const nm = (l?.name ?? "").toLowerCase().trim();
      const emailDup = em ? emails.has(em) : false;
      const nameDup = nm ? names.has(nm) : false;
      return !(emailDup || nameDup);
    });
  }, [investors, leadInvestors]);

  useEffect(() => {
    if (initial) {
      form.reset({
        ...initial,
        selected_terms: initial?.selected_terms ?? [],
        terms_values: initial?.terms_values ?? {},
      });
      if (typeof initial.amount === "number") setAmountDisplay(formatAmount(initial.amount));
    }
  }, [initial]);

  useEffect(() => {
    if (roundId) form.setValue("round_id", roundId);
  }, [roundId]);

  const securityType = form.watch("security_type");
  const selectedTerms = form.watch("selected_terms") ?? [];

  const onSubmit = async (values: RoundInvestmentValues) => {
    let selectedRoundId = values.round_id ?? roundId ?? null;
    if (!selectedRoundId) {
      const label = values.round_label?.trim();
      if (label) {
        const { data: existingRound } = await supabase
          .from("funding_rounds")
          .select("id")
          .eq("round_type", label)
          .maybeSingle();
        if (existingRound) {
          selectedRoundId = (existingRound as any).id;
        } else {
          const { data: userData } = await supabase.auth.getUser();
          const user_id = userData.user?.id;
          if (!user_id) {
            toast({ title: "Not authenticated", variant: "destructive" });
            return;
          }
          const { data: newRound, error: roundErr } = await supabase
            .from("funding_rounds")
            .insert({ user_id, round_type: label, date: null })
            .select("id")
            .single();
          if (roundErr) {
            toast({ title: "Could not create round", description: roundErr.message, variant: "destructive" });
            return;
          }
          selectedRoundId = (newRound as any).id;
        }
      } else {
        toast({ title: "Please enter an investment round", variant: "destructive" });
        return;
      }
    }
    setSubmitting(true);
    try {
      // Resolve or create investor_id
      let investor_id = values.investor_id;

      // If a lead investor was selected, find or create a matching record in investors table
      if (investor_id && investor_id.startsWith("lead:")) {
        const leadId = investor_id.split(":")[1];
        const lead = leadInvestors.find((l) => l.id === leadId);

        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData.user?.id;
        if (!user_id) throw new Error("Not authenticated");

        let resolvedId: string | undefined = undefined;
        if (lead?.email) {
          const { data: foundByEmail } = await supabase
            .from("investors")
            .select("id")
            .eq("email", lead.email)
            .maybeSingle();
          if (foundByEmail) resolvedId = (foundByEmail as any).id;
        }
        if (!resolvedId && lead?.name) {
          const { data: foundByName } = await supabase
            .from("investors")
            .select("id")
            .eq("name", lead.name)
            .maybeSingle();
          if (foundByName) resolvedId = (foundByName as any).id;
        }
        if (!resolvedId) {
          const { data: newInv, error: invErr } = await supabase
            .from("investors")
            .insert({
              user_id,
              name: lead?.name ?? "Lead investor",
              email: lead?.email ?? null,
              firm: lead?.firm ?? null,
            })
            .select("id")
            .single();
          if (invErr) throw invErr;
          resolvedId = (newInv as any).id;
        }
        investor_id = resolvedId;
      }

      if (!investor_id) {
        const name = values.investor_name?.trim();
        if (!name) {
          toast({ title: "Please select or create an investor", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData.user?.id;
        if (!user_id) throw new Error("Not authenticated");

        const { data: newInvestor, error: invError } = await supabase
          .from("investors")
          .insert({ name, user_id })
          .select("id")
          .single();

        if (invError) throw invError;
        investor_id = newInvestor.id;
      }

      // Build extra terms JSON for non-direct terms
      const nonDirect = (values.selected_terms ?? []).filter((t) => !DIRECT_TERM_KEYS.has(t));
      const extraTerms: Record<string, any> = {};
      for (const t of nonDirect) {
        const v = (values.terms_values as any)?.[t];
        if (v !== undefined && v !== "") extraTerms[t] = v;
      }
      const otherTermsPayload =
        Object.keys(extraTerms).length > 0 || (values.other_terms && values.other_terms.trim())
          ? JSON.stringify({ extra: extraTerms, notes: values.other_terms?.trim() || null })
          : values.other_terms ?? null;

      const payload: any = {
        investor_id,
        amount: values.amount,
        role: values.role ?? "participant",
        status: values.status ?? "funded",
        security_type: values.security_type ?? null,
        // Direct columns
        valuation_cap: values.valuation_cap ?? null,
        discount: values.discount ?? null,
        interest_rate: values.interest_rate ?? null,
        maturity_date: values.maturity_date ?? null,
        liquidation_preference: values.liquidation_preference ?? null,
        pro_rata_rights: typeof values.pro_rata_rights === "boolean" ? values.pro_rata_rights : null,
        board_seat: typeof values.board_seat === "boolean" ? values.board_seat : null,
        // Extras
        other_terms: otherTermsPayload,
        description: values.description ?? null,
        notes: values.notes ?? null,
        round_id: selectedRoundId!,
      };

      if (values.id) {
        const { error } = await supabase
          .from("funding_round_investments")
          .update(payload)
          .eq("id", values.id);
        if (error) throw error;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData.user?.id;
        if (!user_id) throw new Error("Not authenticated");

        const { error } = await supabase
          .from("funding_round_investments")
          .insert({ ...payload, user_id });
        if (error) throw error;
      }

      // Milestones auto-refresh via DB trigger; investor stats view reflects totals automatically
      // Close dialog
      toast({ title: values.id ? "Investment updated" : "Investment added" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Investment" : "Add Investment"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Only show round entry when not adding from an existing round card */}
            {!roundId && (
              <div>
                <FormField
                  name="round_label"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Round</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Seed, Series A, SAFE Note" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="investor_id"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor</FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("investor_name", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select investor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-50">
                        <SelectGroup>
                          <SelectLabel>Investors</SelectLabel>
                          {investors.map((i) => (
                            <SelectItem key={i.id} value={i.id}>
                              {i.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Lead investors</SelectLabel>
                          {dedupLeadInvestors.map((li) => (
                            <SelectItem key={li.id} value={`lead:${li.id}`}>
                              {li.name}
                              {li.firm ? ` • ${li.firm}` : ""}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0"
                      onClick={() => setQuickCreateOpen(true)}
                    >
                      New investor
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="investor_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Or create new investor</FormLabel>
                    <FormControl>
                      <Input placeholder="Investor name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                name="amount"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <LabelWithHelp label="Amount (USD)" help="Total amount for this investment in US dollars." />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={amountDisplay}
                        onChange={(e) => {
                          const v = e.target.value;
                          setAmountDisplay(v);
                          const num = parseAmount(v);
                          field.onChange(num);
                        }}
                        onBlur={() => setAmountDisplay(formatAmount(form.getValues("amount") || 0))}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="role"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? "participant"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="co-lead">Co-lead</SelectItem>
                        <SelectItem value="participant">Participant</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="status"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? "funded"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="funded">Funded</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="security_type"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <LabelWithHelp label="Security Type" help="Select the instrument for this investment (e.g., SAFE, Convertible Note, Equity)." />
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select security type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-50">
                      {SECURITY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Key Terms Section - Always visible */}
            <section className="space-y-4 border rounded-lg p-4 bg-muted/20">
              <div className="space-y-3">
                <FormLabel className="text-base font-semibold">
                  <LabelWithHelp label="Investment Terms" help="Select applicable terms and enter their values. This helps track important details of your investment." />
                </FormLabel>
                
                {/* Terms Selection Grid */}
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">Select terms that apply to this investment:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded p-3 bg-background">
                    {TERM_OPTIONS.map((term) => {
                      const checked = selectedTerms.includes(term as string);
                      return (
                        <label key={term} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(c) => {
                              const current = new Set(form.getValues("selected_terms") || []);
                              if (c) current.add(term as string);
                              else current.delete(term as string);
                              form.setValue("selected_terms", Array.from(current));
                            }}
                          />
                          <span className="text-sm leading-tight">{term}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Terms Display */}
                {selectedTerms.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Selected Terms:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerms.map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                          <button
                            type="button"
                            onClick={() => {
                              const current = new Set(form.getValues("selected_terms") || []);
                              current.delete(t);
                              form.setValue("selected_terms", Array.from(current));
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

                {/* Contextual inputs for selected terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTerms.includes("Valuation Cap") && (
                    <FormField
                      name="valuation_cap"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <LabelWithHelp label="Valuation Cap" help="Enter the valuation cap amount." />
                          </FormLabel>
                          <FormControl>
                            <Input type="number" step="any" min={0} placeholder="Cap amount" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedTerms.includes("Discount Rate") && (
                    <FormField
                      name="discount"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <LabelWithHelp label="Discount Rate (%)" help="Enter the discount percentage." />
                          </FormLabel>
                          <FormControl>
                            <Input type="number" step="any" min={0} placeholder="e.g., 20" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedTerms.includes("Interest Rate") && (
                    <FormField
                      name="interest_rate"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <LabelWithHelp label="Interest Rate (%)" help="Interest rate for debt-like instruments." />
                          </FormLabel>
                          <FormControl>
                            <Input type="number" step="any" min={0} placeholder="e.g., 8" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedTerms.includes("Maturity Date") && (
                    <FormField
                      name="maturity_date"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <LabelWithHelp label="Maturity Date" help="Date when the instrument matures." />
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedTerms.includes("Liquidation Preference") && (
                    <FormField
                      name="liquidation_preference"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <LabelWithHelp label="Liquidation Preference" help="e.g., 1x non-participating." />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1x non-participating" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedTerms.includes("Board Seat / Observer Rights") && (
                    <FormField
                      name="board_seat"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <LabelWithHelp label="Board Seat / Observer Rights" help="Check if board seat or observer rights are granted." />
                          </FormLabel>
                          <div className="flex items-center h-10">
                            <Checkbox checked={!!field.value} onCheckedChange={(c) => field.onChange(Boolean(c))} />
                            <span className="ml-2 text-sm">Granted</span>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedTerms.includes("Pro-Rata Rights") && (
                    <FormField
                      name="pro_rata_rights"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <LabelWithHelp label="Pro-Rata Rights" help="Check if investor has pro-rata rights." />
                          </FormLabel>
                          <div className="flex items-center h-10">
                            <Checkbox checked={!!field.value} onCheckedChange={(c) => field.onChange(Boolean(c))} />
                            <span className="ml-2 text-sm">Included</span>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Dynamic fields for non-direct terms */}
                  {selectedTerms
                    .filter((t: string) => !DIRECT_TERM_KEYS.has(t))
                    .map((t: string) => (
                      <div key={t} className="space-y-2">
                        <FormLabel>{t}</FormLabel>
                        <Input
                          placeholder={`Enter value for ${t}`}
                          value={(form.getValues("terms_values") as any)?.[t] || ""}
                          onChange={(e) => {
                            const cur = (form.getValues("terms_values") as any) || {};
                            form.setValue("terms_values", { ...cur, [t]: e.target.value });
                          }}
                        />
                      </div>
                    ))}
                </div>

                {/* Additional freeform notes for terms */}
                <FormField
                  name="other_terms"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Term Notes</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Optional notes about terms" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </section>

            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Description of this investment" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="notes"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Internal notes" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
        <InvestorQuickCreate
          open={quickCreateOpen}
          onOpenChange={setQuickCreateOpen}
          onCreated={(inv) => {
            queryClient.invalidateQueries({ queryKey: ["investors"] });
            form.setValue("investor_id", inv.id);
            form.setValue("investor_name", "");
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
