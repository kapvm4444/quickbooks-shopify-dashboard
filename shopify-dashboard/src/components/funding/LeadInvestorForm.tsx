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
  name: z.string().min(2),
  firm: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  interest_level: z.string().optional(),
});

export type LeadInvestorValues = z.infer<typeof Schema>;

export default function LeadInvestorForm({ open, onOpenChange, initial, roundId }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: LeadInvestorValues; roundId: string | null }) {
  const form = useForm<LeadInvestorValues>({ resolver: zodResolver(Schema), defaultValues: initial ?? {} });
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (initial) form.reset(initial); }, [initial]);

  const onSubmit = async (values: LeadInvestorValues) => {
    setSubmitting(true);
    try {
      const payload: any = { ...values, round_id: roundId };
      if (values.id) {
        const { error } = await supabase.from("lead_investors").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData.user?.id;
        const { error } = await supabase.from("lead_investors").insert({ ...payload, user_id });
        if (error) throw error;
      }
      toast({ title: values.id ? "Investor updated" : "Investor added" });
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
          <DialogTitle>{initial?.id ? "Edit" : "Add"} Lead Investor</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="firm" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Firm</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField name="interest_level" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Level</FormLabel>
                  <FormControl><Input placeholder="e.g., High, Medium" {...field} /></FormControl>
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
