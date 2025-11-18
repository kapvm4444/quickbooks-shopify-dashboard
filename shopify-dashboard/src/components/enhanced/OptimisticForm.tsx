import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOptimisticForm } from '@/hooks/ui/useOptimisticUpdate';
import { useEnhancedToast } from '@/hooks/ui/useEnhancedToast';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';
import { Save, Check } from 'lucide-react';

interface OptimisticFormProps {
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }>;
  onSubmit: (data: Record<string, any>) => Promise<any>;
  initialData?: Record<string, any>;
  submitLabel?: string;
  onSuccess?: (result: any) => void;
}

/**
 * Enhanced form with optimistic updates and better UX
 * Shows immediate feedback while processing in the background
 */
export const OptimisticForm: React.FC<OptimisticFormProps> = ({
  title,
  fields,
  onSubmit,
  initialData = {},
  submitLabel = "Save",
  onSuccess
}) => {
  const [formData, setFormData] = useState(initialData);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isSubmitting, submitWithOptimistic } = useOptimisticForm();
  const { showOperationSuccess, showOperationError, showValidationError } = useEnhancedToast();

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        errors.push(field.label);
      }
    });
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showValidationError(validationErrors);
      return;
    }

    try {
      await submitWithOptimistic(
        // Optimistic update - show success immediately
        () => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        },
        // API call
        () => onSubmit(formData),
        // Success message
        `${title} saved successfully`,
        // On success callback
        (result) => {
          onSuccess?.(result);
        },
        // On error callback
        (error) => {
          setShowSuccess(false);
          showOperationError("Save", error.message);
        }
      );
    } catch (error) {
      // Error already handled in submitWithOptimistic
    }
  };

  return (
    <Card className="relative">
      {showSuccess && (
        <div className="absolute inset-0 bg-primary/5 rounded-lg flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Check className="h-5 w-5" />
            Changes saved!
          </div>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {isSubmitting && <LoadingSpinner size="sm" />}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              <Input
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                disabled={isSubmitting}
                className={isSubmitting ? 'opacity-50' : ''}
              />
            </div>
          ))}
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full gap-2"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {submitLabel}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};