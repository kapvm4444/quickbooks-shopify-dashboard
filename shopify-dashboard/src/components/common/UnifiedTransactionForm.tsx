import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Upload, FileIcon } from 'lucide-react';
import { useCreateARTransaction, useCreateAPTransaction } from '@/hooks/useARAPData';
import { useVendors } from '@/hooks/useVendorData';
import { useFileUpload } from '@/hooks/useFileUpload';
import { 
  TextField, 
  TextAreaField, 
  SelectField, 
  FormGrid,
  TRANSACTION_STATUSES 
} from './FormFields';

// Base schema for common fields
const baseTransactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  invoice_number: z.string().optional(),
  due_date: z.string().optional(),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  description: z.string().optional(),
  status: z.enum(['outstanding', 'paid', 'overdue']),
});

// AR-specific schema
const arTransactionSchema = baseTransactionSchema.extend({
  customer_name: z.string().min(1, 'Customer name is required'),
});

// AP-specific schema  
const apTransactionSchema = baseTransactionSchema.extend({
  vendor_id: z.string().min(1, 'Vendor is required'),
  vendor_name: z.string().min(1, 'Vendor name is required'),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string(),
  })).optional(),
});

type ARTransactionForm = z.infer<typeof arTransactionSchema>;
type APTransactionForm = z.infer<typeof apTransactionSchema>;

interface UnifiedTransactionFormProps {
  type: 'ar' | 'ap';
  onSuccess?: () => void;
}

export const UnifiedTransactionForm: React.FC<UnifiedTransactionFormProps> = ({ 
  type, 
  onSuccess 
}) => {
  const createARTransaction = useCreateARTransaction();
  const createAPTransaction = useCreateAPTransaction();
  const { data: vendors } = useVendors();
  const { uploadFile, uploading } = useFileUpload();
  
  const [attachments, setAttachments] = useState<Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>>([]);

  const form = useForm<ARTransactionForm | APTransactionForm>({
    resolver: zodResolver(type === 'ar' ? arTransactionSchema : apTransactionSchema),
    defaultValues: type === 'ar' ? {
      customer_name: '',
      invoice_number: '',
      amount: 0,
      due_date: '',
      transaction_date: new Date().toISOString().split('T')[0],
      description: '',
      status: 'outstanding' as const,
    } : {
      vendor_id: '',
      vendor_name: '',
      invoice_number: '',
      amount: 0,
      due_date: '',
      transaction_date: new Date().toISOString().split('T')[0],
      description: '',
      status: 'outstanding' as const,
      attachments: [],
    } as APTransactionForm,
  });

  const handleVendorChange = (vendorId: string) => {
    if (type === 'ap') {
      const selectedVendor = vendors?.find(v => v.id === vendorId);
      if (selectedVendor) {
        form.setValue('vendor_id', vendorId);
        form.setValue('vendor_name', selectedVendor.name);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'ap') {
      const files = event.target.files;
      if (!files) return;

      for (const file of Array.from(files)) {
        const uploadedFile = await uploadFile(file, 'ap-attachments', 'invoices');
        if (uploadedFile) {
          setAttachments(prev => [...prev, uploadedFile]);
        }
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    try {
      if (type === 'ar') {
        await createARTransaction.mutateAsync({
          customer_name: data.customer_name,
          invoice_number: data.invoice_number || null,
          amount: Number(data.amount),
          due_date: data.due_date || null,
          transaction_date: data.transaction_date,
          description: data.description || null,
          status: data.status,
        });
      } else {
        await createAPTransaction.mutateAsync({
          vendor_id: data.vendor_id,
          vendor_name: data.vendor_name,
          invoice_number: data.invoice_number || null,
          amount: Number(data.amount),
          due_date: data.due_date || null,
          transaction_date: data.transaction_date,
          description: data.description || null,
          status: data.status,
          attachments,
        });
      }
      
      form.reset();
      setAttachments([]);
      onSuccess?.();
    } catch (error) {
      console.error(`Error creating ${type.toUpperCase()} transaction:`, error);
    }
  };

  const isLoading = createARTransaction.isPending || createAPTransaction.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {type === 'ar' ? (
        <TextField
          id="customer_name"
          label="Customer Name"
          form={form}
          required
          placeholder="Enter customer name"
          error={(form.formState.errors as any).customer_name?.message}
        />
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Vendor<span className="text-destructive">*</span>
          </label>
          <select
            {...form.register('vendor_id')}
            onChange={(e) => handleVendorChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select vendor</option>
            {vendors?.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
          {(form.formState.errors as any).vendor_id && (
            <p className="text-sm text-destructive">
              {(form.formState.errors as any).vendor_id.message}
            </p>
          )}
        </div>
      )}

      <TextField
        id="invoice_number"
        label="Invoice Number"
        form={form}
        placeholder="Enter invoice number (optional)"
      />

      <FormGrid cols={2}>
        <TextField
          id="amount"
          label="Amount"
          form={form}
          type="number"
          step="0.01"
          placeholder="0.00"
          required
          error={(form.formState.errors as any).amount?.message}
        />

        <SelectField
          id="status"
          label="Status"
          form={form}
          options={TRANSACTION_STATUSES}
          defaultValue="outstanding"
          required
        />
      </FormGrid>

      <FormGrid cols={2}>
        <TextField
          id="transaction_date"
          label="Transaction Date"
          form={form}
          type="date"
          required
          error={(form.formState.errors as any).transaction_date?.message}
        />

        <TextField
          id="due_date"
          label="Due Date"
          form={form}
          type="date"
        />
      </FormGrid>

      <TextAreaField
        id="description"
        label="Description"
        form={form}
        placeholder="Enter description (optional)"
      />

      {type === 'ap' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Attachments</label>
          <div className="border-2 border-dashed border-border rounded-lg p-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Support PDF, images, and documents
              </p>
            </div>
          </div>
          
          {attachments.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Uploaded Files</label>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <FileIcon className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : `Create ${type.toUpperCase()} Transaction`}
      </Button>
    </form>
  );
};