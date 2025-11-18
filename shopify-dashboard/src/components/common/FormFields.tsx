import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Common expense categories
export const EXPENSE_CATEGORIES = [
  "Marketing",
  "Development", 
  "Operations",
  "Equipment",
  "Personnel",
  "Professional Services",
  "Travel",
  "Software & Licenses",
  "Office Supplies",
  "Utilities",
  "Other"
];

// Common status options
export const EXPENSE_STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" }
];

export const TRANSACTION_STATUSES = [
  { value: "outstanding", label: "Outstanding" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" }
];

interface FormFieldProps {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
}

interface TextFieldProps extends FormFieldProps {
  form: UseFormReturn<any>;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'tel' | 'date';
  step?: string;
}

interface TextAreaFieldProps extends FormFieldProps {
  form: UseFormReturn<any>;
  placeholder?: string;
  rows?: number;
}

interface SelectFieldProps extends FormFieldProps {
  options: { value: string; label: string }[] | string[];
  form: UseFormReturn<any>;
  placeholder?: string;
  defaultValue?: string;
}

interface DateFieldProps extends FormFieldProps {
  form: UseFormReturn<any>;
  placeholder?: string;
}

/**
 * Reusable text input field
 */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  id,
  form,
  required = false,
  error,
  placeholder,
  type = 'text',
  step
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>
      {label}
      {required && <span className="text-destructive">*</span>}
    </Label>
    <Input
      id={id}
      type={type}
      step={step}
      {...form.register(id, { 
        valueAsNumber: type === 'number' ? true : false 
      })}
      placeholder={placeholder}
    />
    {error && (
      <p className="text-sm text-destructive">{error}</p>
    )}
  </div>
);

/**
 * Reusable textarea field
 */
export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  id,
  form,
  required = false,
  error,
  placeholder,
  rows = 3
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>
      {label}
      {required && <span className="text-destructive">*</span>}
    </Label>
    <Textarea
      id={id}
      {...form.register(id)}
      placeholder={placeholder}
      rows={rows}
    />
    {error && (
      <p className="text-sm text-destructive">{error}</p>
    )}
  </div>
);

/**
 * Reusable select field
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  id,
  form,
  options,
  required = false,
  error,
  placeholder,
  defaultValue
}) => {
  const optionItems = Array.isArray(options[0]) 
    ? (options as string[]).map(opt => ({ value: opt, label: opt }))
    : options as { value: string; label: string }[];

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Select 
        value={form.watch(id)} 
        onValueChange={(value) => form.setValue(id, value)}
        defaultValue={defaultValue}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {optionItems.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

/**
 * Reusable date picker field
 */
export const DateField: React.FC<DateFieldProps> = ({
  label,
  id,
  form,
  required = false,
  error,
  placeholder = "Pick a date"
}) => {
  const selectedDate = form.watch(id);

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-full",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => form.setValue(id, date)}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

/**
 * Grid layout wrapper for form fields
 */
export const FormGrid: React.FC<{ 
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}> = ({ children, cols = 2, className }) => (
  <div className={cn(`grid grid-cols-1 md:grid-cols-${cols} gap-4`, className)}>
    {children}
  </div>
);