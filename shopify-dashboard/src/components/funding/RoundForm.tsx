import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Update schema to include target_amount, start_date, end_date for simplified Round Card
const Schema = z.object({
  id: z.string().optional(),
  round_type: z.string().min(1, "Required"),
  status: z.enum(["planned", "active", "closed"]).optional(),
  target_amount: z.coerce.number().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  notes: z.string().optional(),

  amount_raised: z.coerce.number().optional(),
  date: z.date().optional(),
  valuation_pre: z.coerce.number().optional(),
  valuation_post: z.coerce.number().optional(),
  lead_investor: z.string().optional(),
  other_investors: z.string().optional(),
});

export type RoundValues = z.infer<typeof Schema>;

// Allowed round types (must match backend canonicalization)
const ROUND_TYPES = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Bridge",
  "SAFE",
  "Convertible Note",
  "Other",
];

export default function RoundForm({ open, onOpenChange, initial }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: RoundValues }) {
  const form = useForm<RoundValues>({ resolver: zodResolver(Schema), defaultValues: initial ?? {} });
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Reset the form cleanly whenever the dialog opens
  useEffect(() => {
    if (!open) return;
    if (initial) form.reset(initial);
    else form.reset({});
  }, [open, initial, form]);

  const onSubmit = async (values: RoundValues) => {
    setSubmitting(true);
    try {
      const payload: any = {
        round_type: values.round_type,
        status: values.status ?? null,
        target_amount: values.target_amount ?? null,
        start_date: values.start_date ? new Date(values.start_date).toISOString().slice(0,10) : null,
        end_date: values.end_date ? new Date(values.end_date).toISOString().slice(0,10) : null,
        notes: values.notes ?? null,
      };

      if (values.id) {
        const { error } = await supabase.from("funding_rounds").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData.user?.id;
        const { error } = await supabase.from("funding_rounds").insert({ ...payload, user_id });
        if (error) throw error;
      }
      toast({ title: values.id ? "Round updated" : "Round added" });
      onOpenChange(false);
    } catch (e: any) {
      const description =
        e?.code === "23505"
          ? "A round of this type already exists for your account. Please edit the existing round or choose another type."
          : e?.message;
      toast({ title: "Save failed", description, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Round" : "Add Funding Round"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="round_type"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Round</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select round type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROUND_TYPES.map((rt) => (
                          <SelectItem key={rt} value={rt}>
                            {rt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField name="status" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="target_amount" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField name="start_date" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("justify-start font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? new Date(field.value).toDateString() : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-background" align="start">
                      <Calendar mode="single" selected={field.value as any} onSelect={field.onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )} />
              <FormField name="end_date" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("justify-start font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? new Date(field.value).toDateString() : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-background" align="start">
                      <Calendar mode="single" selected={field.value as any} onSelect={field.onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
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
