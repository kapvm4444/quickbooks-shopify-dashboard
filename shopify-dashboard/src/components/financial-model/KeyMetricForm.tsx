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
  metric_name: z.string().min(2),
  metric_value: z.coerce.number(),
  unit: z.string().optional(),
  period: z.string().optional(),
  note: z.string().optional(),
});

export type MetricValues = z.infer<typeof Schema>;

export default function KeyMetricForm({ open, onOpenChange, initial }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: MetricValues }) {
  const form = useForm<MetricValues>({ resolver: zodResolver(Schema), defaultValues: initial ?? {} });
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (initial) form.reset(initial); }, [initial]);

  const onSubmit = async (values: MetricValues) => {
    setSubmitting(true);
    try {
      const payload: any = { ...values };
      if (values.id) {
        const { error } = await supabase.from("financial_model_key_metrics").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData.user?.id;
        const { error } = await supabase.from("financial_model_key_metrics").insert({ ...payload, user_id });
        if (error) throw error;
      }
      toast({ title: values.id ? "Metric updated" : "Metric added" });
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
          <DialogTitle>{initial?.id ? "Edit" : "Add"} Key Metric</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="metric_name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. ROI" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="metric_value" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField name="unit" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl><Input placeholder="%, $, years" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField name="period" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <FormControl><Input placeholder="e.g. 5y" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
            <FormField name="note" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl><Textarea rows={3} {...field} placeholder="Optional note" /></FormControl>
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
