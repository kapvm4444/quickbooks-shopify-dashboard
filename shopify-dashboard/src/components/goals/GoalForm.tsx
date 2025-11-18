import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const GoalSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(["annual", "quarterly", "financial", "growth", "team"]).optional(),
  unit: z.string().optional(),
  target_value: z.coerce.number().optional(),
  current_value: z.coerce.number().optional(),
  
  due_date: z.date().optional(),
  status: z.enum(["not_started", "in_progress", "completed", "on_hold"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export type GoalFormValues = z.infer<typeof GoalSchema>;

export function GoalForm({ open, onOpenChange, initial }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: GoalFormValues }) {
  const { toast } = useToast();
  const form = useForm<GoalFormValues>({ resolver: zodResolver(GoalSchema), defaultValues: initial ?? {} });
  const [submitting, setSubmitting] = useState(false);

  useMemo(() => {
    if (initial) form.reset(initial);
  }, [initial, form]);

  const onSubmit = async (values: GoalFormValues) => {
    setSubmitting(true);
    try {
      const payload: any = {
        title: values.title,
        description: values.description ?? null,
        category: values.category ?? null,
        unit: values.unit ?? null,
        target_value: values.target_value ?? null,
        current_value: values.current_value ?? null,
        
        due_date: values.due_date ? new Date(values.due_date).toISOString().slice(0, 10) : null,
        status: values.status ?? undefined,
        priority: values.priority ?? undefined,
      };

      let error;
      if (values.id) {
        const { error: e } = await supabase.from("goals").update(payload).eq("id", values.id);
        error = e;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData.user?.id;
        const { error: e } = await supabase.from("goals").insert({ ...payload, user_id });
        error = e;
      }

      if (error) throw error;
      toast({ title: values.id ? "Goal updated" : "Goal added" });
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
          <DialogTitle>{initial?.id ? "Edit Goal" : "Add Goal"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="title" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. Annual Revenue Goal" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea {...field} placeholder="Optional details" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="category" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="status" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not_started">Not started</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="target_value" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Target</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField name="current_value" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Current</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField name="unit" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl><Input placeholder="e.g. $ or %" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="due_date" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("justify-start font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? new Date(field.value).toDateString() : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value as any}
                        onSelect={field.onChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="priority" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

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
