
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Schema = z.object({
  id: z.string().optional(),
  runway_months: z.coerce.number().min(0).optional(),
  cash_on_hand: z.coerce.number().min(0).optional(),
  monthly_burn: z.coerce.number().min(0).optional(),
  override_total_raised: z.coerce.number().min(0).optional(),
  override_current_valuation: z.coerce.number().min(0).optional(),
  override_active_investors: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

export type FundingOverviewValues = z.infer<typeof Schema>;

export default function FundingOverviewForm({
  open,
  onOpenChange,
  initial,
  roundId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: FundingOverviewValues;
  roundId: string | null;
}) {
  const form = useForm<FundingOverviewValues>({
    resolver: zodResolver(Schema),
    defaultValues: initial ?? {},
  });
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) form.reset(initial);
    if (!initial) form.reset({});
  }, [initial]);

  const onSubmit = async (values: FundingOverviewValues) => {
    setSubmitting(true);
    try {
      // Build payload aligning to DB columns
      const payload: any = {
        runway_months: values.runway_months ?? null,
        cash_on_hand: values.cash_on_hand ?? null,
        monthly_burn: values.monthly_burn ?? null,
        override_total_raised: values.override_total_raised ?? null,
        override_current_valuation: values.override_current_valuation ?? null,
        override_active_investors: values.override_active_investors ?? null,
        notes: values.notes ?? null,
        round_id: roundId ?? null,
      };

      if (values.id) {
        const { error } = await supabase.from("funding_overview").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const user_id = userData.user?.id;
        if (!user_id) throw new Error("You must be logged in to save overview data.");
        const { error } = await supabase.from("funding_overview").insert({ ...payload, user_id });
        if (error) throw error;
      }

      toast({ title: values.id ? "Overview updated" : "Overview added" });
      onOpenChange(false);
    } catch (e: any) {
      console.error("Saving funding_overview failed:", e);
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit" : "Add"} Funding Overview</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                name="cash_on_hand"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cash on Hand ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="monthly_burn"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Burn ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="runway_months"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Runway (months)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                name="override_total_raised"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Override: Total Raised ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="override_current_valuation"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Override: Current Valuation ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="override_active_investors"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Override: Active Investors</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="notes"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
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
      </DialogContent>
    </Dialog>
  );
}
