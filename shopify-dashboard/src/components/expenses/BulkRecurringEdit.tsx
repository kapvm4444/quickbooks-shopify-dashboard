import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FinancialRecord } from '@/types/business';

interface BulkRecurringEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTransactions: FinancialRecord[];
  onSuccess?: () => void;
}

const recurrencePatterns = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const getDayOptions = (pattern: string) => {
  switch (pattern) {
    case 'weekly':
      return [
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' },
        { value: 7, label: 'Sunday' },
      ];
    default:
      return Array.from({ length: 31 }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}`,
      }));
  }
};

export function BulkRecurringEdit({ open, onOpenChange, selectedTransactions, onSuccess }: BulkRecurringEditProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [makeRecurring, setMakeRecurring] = useState(true);
  const [recurrencePattern, setRecurrencePattern] = useState<string>('');
  const [recurrenceDay, setRecurrenceDay] = useState<number>();
  const [endDate, setEndDate] = useState<Date>();

  const handleSubmit = async () => {
    if (selectedTransactions.length === 0) return;

    setIsSubmitting(true);
    try {
      const updates = selectedTransactions.map(transaction => ({
        id: transaction.id,
        is_recurring: makeRecurring,
        recurrence_pattern: makeRecurring ? recurrencePattern : null,
        recurrence_day: makeRecurring ? recurrenceDay : null,
        end_date: makeRecurring && endDate ? endDate.toISOString().split('T')[0] : null,
      }));

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('financial_records')
          .update({
            is_recurring: update.is_recurring,
            recurrence_pattern: update.recurrence_pattern,
            recurrence_day: update.recurrence_day,
            end_date: update.end_date,
          })
          .eq('id', update.id);
        
        if (updateError) throw updateError;
      }

      toast({
        title: 'Success',
        description: `Updated ${selectedTransactions.length} transactions`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error updating transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to update transactions',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Bulk Edit Recurring Status ({selectedTransactions.length} transactions)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="make_recurring"
              checked={makeRecurring}
              onCheckedChange={(checked) => setMakeRecurring(!!checked)}
            />
            <Label htmlFor="make_recurring">Mark as recurring expenses</Label>
          </div>

          {makeRecurring && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
              <div className="space-y-2">
                <Label>Recurrence Pattern</Label>
                <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {recurrencePatterns.map((pattern) => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {recurrencePattern && (
                <div className="space-y-2">
                  <Label>
                    {recurrencePattern === 'weekly' ? 'Day of Week' : 'Day of Period'}
                  </Label>
                  <Select
                    value={recurrenceDay?.toString()}
                    onValueChange={(value) => setRecurrenceDay(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDayOptions(recurrencePattern).map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || (makeRecurring && (!recurrencePattern || !recurrenceDay))}>
              {isSubmitting ? 'Updating...' : 'Update Transactions'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}