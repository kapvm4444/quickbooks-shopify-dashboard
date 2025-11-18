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
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Schema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  target_date: z.date().optional(),
  status: z.string().optional(),
});

export type MilestoneValues = z.infer<typeof Schema>;

export default function MilestoneForm({ open, onOpenChange, initial, roundId }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: MilestoneValues; roundId: string | null }) {
  const form = useForm<MilestoneValues>({ resolver: zodResolver(Schema), defaultValues: initial ?? {} });
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (initial) form.reset(initial); }, [initial]);

  const onSubmit = async (values: MilestoneValues) => {
    setSubmitting(true);
    try {
      const payload: any = {
        title: values.title,
        description: values.description ?? null,
        target_date: values.target_date ? new Date(values.target_date).toISOString().slice(0,10) : null,
        status: values.status ?? null,
        round_id: roundId,
      };
      if (values.id) {
        const { error } = await supabase.from("funding_milestones").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData.user?.id;
        const { error } = await supabase.from("funding_milestones").insert({ ...payload, user_id });
        if (error) throw error;
      }
      toast({ title: values.id ? "Milestone updated" : "Milestone added" });
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
          <DialogTitle>{initial?.id ? "Edit" : "Add"} Milestone</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="title" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
              </FormItem>
            )} />
            <FormField name="status" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl><Input placeholder="planned, in_progress, completed" {...field} /></FormControl>
              </FormItem>
            )} />
            <FormField name="target_date" control={form.control} render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Target Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className={cn("justify-start font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? new Date(field.value).toDateString() : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value as any} onSelect={field.onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
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
