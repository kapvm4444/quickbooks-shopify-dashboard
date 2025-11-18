import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateVendor } from '@/hooks/useVendorData';
import { useCreateVendorContact, CreateVendorContactData } from '@/hooks/useVendorContacts';

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  category: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  status: z.string().optional(),
  notes: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  on_time_delivery: z.number().min(0).max(100).optional(),
  cost_score: z.number().min(0).max(100).optional(),
  quality_score: z.number().min(0).max(100).optional(),
  // Contact fields
  addInitialContact: z.boolean().default(false),
  contact_name: z.string().optional(),
  contact_role: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  contact_title: z.string().optional(),
  contact_department: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface AddVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddVendorDialog = ({ open, onOpenChange }: AddVendorDialogProps) => {
  const createVendor = useCreateVendor();
  const createContact = useCreateVendorContact();
  
  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      category: '',
      location: '',
      website: '',
      status: 'active',
      notes: '',
      rating: undefined,
      on_time_delivery: undefined,
      cost_score: undefined,
      quality_score: undefined,
      addInitialContact: false,
      contact_name: '',
      contact_role: 'primary',
      contact_email: '',
      contact_phone: '',
      contact_title: '',
      contact_department: '',
    },
  });

  const watchAddContact = form.watch('addInitialContact');

  const onSubmit = async (data: VendorFormData) => {
    try {
      // Create the vendor first
      const vendor = await createVendor.mutateAsync({
        name: data.name,
        category: data.category || undefined,
        location: data.location || undefined,
        website: data.website || undefined,
        status: data.status || 'active',
        notes: data.notes || undefined,
        rating: data.rating,
        on_time_delivery: data.on_time_delivery,
        cost_score: data.cost_score,
        quality_score: data.quality_score,
      });

      // If user wants to add an initial contact, create it
      if (data.addInitialContact && data.contact_name?.trim()) {
        const contactData: CreateVendorContactData = {
          vendor_id: vendor.id,
          name: data.contact_name.trim(),
          role: (data.contact_role as any) || 'primary',
          email: data.contact_email || undefined,
          phone: data.contact_phone || undefined,
          title: data.contact_title || undefined,
          department: data.contact_department || undefined,
          is_primary: true,
        };

        await createContact.mutateAsync(contactData);
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating vendor:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vendor Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Enter vendor name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => form.setValue('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Packaging">Packaging</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Specialty">Specialty</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...form.register('location')}
                  placeholder="City, State/Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  {...form.register('website')}
                  placeholder="https://example.com"
                />
                {form.formState.errors.website && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.website.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => form.setValue('status', value)} defaultValue="active">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Initial Contact */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="addInitialContact"
                checked={watchAddContact}
                onCheckedChange={(checked) => form.setValue('addInitialContact', checked)}
              />
              <Label htmlFor="addInitialContact" className="text-lg font-medium">
                Add Initial Contact
              </Label>
            </div>
            
            {watchAddContact && (
              <div className="space-y-4 pl-6 border-l-2 border-muted">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Contact Name *</Label>
                    <Input
                      id="contact_name"
                      {...form.register('contact_name')}
                      placeholder="Enter contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_role">Role</Label>
                    <Select onValueChange={(value) => form.setValue('contact_role', value)} defaultValue="primary">
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary Contact</SelectItem>
                        <SelectItem value="billing">Billing Contact</SelectItem>
                        <SelectItem value="technical">Technical Contact</SelectItem>
                        <SelectItem value="sales">Sales Contact</SelectItem>
                        <SelectItem value="support">Support Contact</SelectItem>
                        <SelectItem value="procurement">Procurement Contact</SelectItem>
                        <SelectItem value="quality">Quality Contact</SelectItem>
                        <SelectItem value="logistics">Logistics Contact</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      {...form.register('contact_email')}
                      placeholder="Enter email"
                    />
                    {form.formState.errors.contact_email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contact_email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Phone</Label>
                    <Input
                      id="contact_phone"
                      {...form.register('contact_phone')}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_title">Title</Label>
                    <Input
                      id="contact_title"
                      {...form.register('contact_title')}
                      placeholder="Job title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_department">Department</Label>
                    <Input
                      id="contact_department"
                      {...form.register('contact_department')}
                      placeholder="Department"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Performance Metrics (Optional)</h3>
            <p className="text-sm text-muted-foreground">
              These fields are optional and can be updated later as you track vendor performance.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Overall Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  {...form.register('rating', { valueAsNumber: true })}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="on_time_delivery">On-Time Delivery (%)</Label>
                <Input
                  id="on_time_delivery"
                  type="number"
                  min="0"
                  max="100"
                  {...form.register('on_time_delivery', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_score">Cost Score (0-100)</Label>
                <Input
                  id="cost_score"
                  type="number"
                  min="0"
                  max="100"
                  {...form.register('cost_score', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality_score">Quality Score (0-100)</Label>
                <Input
                  id="quality_score"
                  type="number"
                  min="0"
                  max="100"
                  {...form.register('quality_score', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Additional notes about the vendor..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createVendor.isPending || createContact.isPending}>
              {(createVendor.isPending || createContact.isPending) ? 'Creating...' : 'Create Vendor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};