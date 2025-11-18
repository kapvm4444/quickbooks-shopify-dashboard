import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Schema = z.object({
  id: z.string().optional(),
  category: z.string().min(1),
  amount: z.coerce.number().optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  selected_round_id: z.string().optional(),
  round_label: z.string().optional(),
});

export type UseOfFundsValues = z.infer<typeof Schema>;

interface Round { id: string; round_type: string; date: string | null; }

export default function UseOfFundsForm({ open, onOpenChange, initial, roundId }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: UseOfFundsValues; roundId: string | null }) {
  const form = useForm<UseOfFundsValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      ...(initial ?? {}),
      selected_round_id: (initial as any)?.round_id ?? roundId ?? undefined,
    },
  });
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [showRoundInput, setShowRoundInput] = useState(false);

  // New: local state for round totals and preview percentage
  const [roundTotal, setRoundTotal] = useState<number | null>(null);
  const [loadingRoundTotal, setLoadingRoundTotal] = useState(false);

  // Watch form values for live calculations
  const watchedAmount = useWatch({ control: form.control, name: "amount" });
  const watchedRoundId = useWatch({ control: form.control, name: "selected_round_id" });

  useEffect(() => {
    // Prefill selection when editing or when a round is selected on the page
    form.reset({
      ...(initial ?? {}),
      selected_round_id: (initial as any)?.round_id ?? roundId ?? undefined,
    });
    setShowRoundInput(false);
  }, [initial, roundId]);
  
  useEffect(() => {
    if (!open) return;
    const loadRounds = async () => {
      const { data, error } = await supabase
        .from("funding_rounds")
        .select("id, round_type, date");
      if (!error && data) setRounds(data as any);
    };
    loadRounds();
  }, [open]);

  // New: fetch the total for the selected round (amount_raised or sum of investments)
  useEffect(() => {
    const fetchRoundTotal = async (rid: string) => {
      setLoadingRoundTotal(true);
      try {
        let total = 0;

        // Try funding_rounds.amount_raised
        const { data: fr, error: frErr } = await supabase
          .from("funding_rounds")
          .select("amount_raised")
          .eq("id", rid)
          .maybeSingle();
        if (frErr) {
          console.error("Error fetching funding_rounds:", frErr);
        }
        const raised = Number(fr?.amount_raised ?? 0);

        if (raised > 0) {
          total = raised;
        } else {
          // Fallback to sum of funding_round_investments.amount
          const { data: inv, error: invErr } = await supabase
            .from("funding_round_investments")
            .select("amount")
            .eq("round_id", rid);
          if (invErr) {
            console.error("Error fetching funding_round_investments:", invErr);
          }
          const sum = (inv ?? []).reduce((s, it: any) => s + Number(it.amount || 0), 0);
          total = sum;
        }

        setRoundTotal(Number.isFinite(total) && total > 0 ? total : 0);
      } catch (e) {
        console.error("Failed to compute round total:", e);
        setRoundTotal(0);
      } finally {
        setLoadingRoundTotal(false);
      }
    };

    if (watchedRoundId) {
      fetchRoundTotal(watchedRoundId);
    } else {
      setRoundTotal(null);
    }
  }, [watchedRoundId]);

  // New: auto-calculate percentage client-side for instant feedback
  useEffect(() => {
    const amt = Number(watchedAmount);
    if (roundTotal && roundTotal > 0 && Number.isFinite(amt) && amt >= 0) {
      const pct = Math.max(0, Math.min(100, Number(((amt / roundTotal) * 100).toFixed(2))));
      form.setValue("percentage", pct, { shouldValidate: true, shouldDirty: true });
    } else {
      // Unknown or zero round total; let server compute later or leave undefined
      form.setValue("percentage", undefined, { shouldDirty: true });
    }
  }, [watchedAmount, roundTotal, form]);

  const onSubmit = async (values: UseOfFundsValues) => {
    // Updated: require only amount (percentage is auto-calculated)
    if (!values.selected_round_id && !roundId && !values.round_label) {
      toast({ title: "Select a round or enter one", variant: "destructive" });
      return;
    }
    if (!values.amount) {
      toast({ title: "Enter amount", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let resolvedRoundId: string | undefined = values.selected_round_id ?? roundId ?? undefined;
      if (!resolvedRoundId) {
        const label = values.round_label?.trim();
        if (label) {
          const { data: existingRound } = await supabase
            .from("funding_rounds")
            .select("id")
            .eq("round_type", label)
            .maybeSingle();
          if (existingRound) {
            resolvedRoundId = (existingRound as any).id;
          } else {
            const { data: userData } = await supabase.auth.getUser();
            const user_id = userData.user?.id;
            if (!user_id) throw new Error("Not authenticated");
            const { data: newRound, error: roundErr } = await supabase
              .from("funding_rounds")
              .insert({ user_id, round_type: label, date: null })
              .select("id")
              .single();
            if (roundErr) throw roundErr;
            resolvedRoundId = (newRound as any).id;
          }
        }
      }

      if (!resolvedRoundId) throw new Error("Round is required");

      const payload: any = {
        category: values.category,
        amount: values.amount ?? null,
        // percentage will be computed server-side trigger; we still pass our preview if present
        percentage: values.percentage ?? null,
        notes: values.notes ?? null,
        round_id: resolvedRoundId,
      };
      if (values.id) {
        const { error } = await supabase.from("use_of_funds").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData.user?.id;
        const { error } = await supabase.from("use_of_funds").insert({ ...payload, user_id });
        if (error) throw error;
      }
      toast({ title: values.id ? "Item updated" : "Item added" });
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
          <DialogTitle>{initial?.id ? "Edit" : "Add"} Use of Funds</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="category" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. Product Development" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField
              name="selected_round_id"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Round</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => {
                        if (v === "__new__") {
                          setShowRoundInput(true);
                          field.onChange("");
                        } else {
                          setShowRoundInput(false);
                          field.onChange(v);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an investment round" />
                      </SelectTrigger>
                      <SelectContent>
                        {rounds.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.round_type}{r.date ? ` • ${r.date}` : ""}
                          </SelectItem>
                        ))}
                        <SelectItem value="__new__">Create new round…</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showRoundInput && (
              <FormField
                name="round_label"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New round name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Seed, Series A" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="amount" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  {/* Helper: show live percentage if we know the round total */}
                  <div className="text-xs text-muted-foreground">
                    {watchedRoundId
                      ? loadingRoundTotal
                        ? "Calculating percentage..."
                        : roundTotal && roundTotal > 0 && Number(field.value) >= 0
                          ? `${(((Number(field.value) || 0) / roundTotal) * 100).toFixed(2)}% of $${roundTotal.toLocaleString()}`
                          : "Percentage will be computed after save once the round total is known."
                      : "Select a round to auto-calculate the percentage."}
                  </div>
                </FormItem>
              )} />
              <FormField name="percentage" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" min={0} max={100} value={field.value ?? ""} readOnly disabled />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    Auto-calculated from Amount ÷ Round Total; finalized by the server.
                  </div>
                </FormItem>
              )} />
            </div>
            <FormField name="notes" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
