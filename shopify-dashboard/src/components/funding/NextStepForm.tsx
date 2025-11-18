import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Schema = z.object({
  id: z.string().optional(),
  description: z.string().min(2),
  owner: z.string().optional(),
  due_date: z.date().optional(),
  status: z.string().optional(),
});

export type NextStepValues = z.infer<typeof Schema>;

export default function NextStepForm({ open, onOpenChange, initial, roundId }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: NextStepValues; roundId: string | null }) {
  const form = useForm<NextStepValues>({ resolver: zodResolver(Schema), defaultValues: initial ?? {} });
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (initial) form.reset(initial); }, [initial]);

  const onSubmit = async (values: NextStepValues) => {
    setSubmitting(true);
    try {
      const payload: any = {
        description: values.description,
        owner: values.owner ?? null,
        due_date: values.due_date ? new Date(values.due_date).toISOString().slice(0,10) : null,
        status: values.status ?? null,
        round_id: roundId,
      };
      if (values.id) {
        const { error } = await supabase.from("funding_next_steps").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData.user?.id;
        const { error } = await supabase.from("funding_next_steps").insert({ ...payload, user_id });
        if (error) throw error;
      }
      toast({ title: values.id ? "Next step updated" : "Next step added" });
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
          <DialogTitle>{initial?.id ? "Edit" : "Add"} Next Step</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="owner" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField name="status" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl><Input placeholder="open, closed, in_progress" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
            <FormField name="due_date" control={form.control} render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
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
