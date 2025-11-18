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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, Edit, Trash2, Mail, Phone, Globe, MapPin, DollarSign, Calendar, FileIcon } from 'lucide-react';
import { Vendor, useUpdateVendor, useDeleteVendor } from "@/hooks/useVendorData";
import { useVendorPurchaseHistory } from "@/hooks/useVendorMetrics";
import { useAPTransactionsByVendor } from "@/hooks/useARAPData";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VendorContactsManager } from "./VendorContactsManager";

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  category: z.string().optional(),
  contact_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  on_time_delivery: z.number().min(0).max(100).optional(),
  cost_score: z.number().min(0).max(100).optional(),
  quality_score: z.number().min(0).max(100).optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorDetailsDialogProps {
  vendor: Vendor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VendorDetailsDialog = ({ vendor, open, onOpenChange }: VendorDetailsDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();
  const { purchaseOrders, metrics: purchaseMetrics, isLoading: isPurchaseLoading } = useVendorPurchaseHistory(vendor?.id || '');
  const { data: apTransactions } = useAPTransactionsByVendor(vendor?.id || '');
  
  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    values: vendor ? {
      name: vendor.name,
      category: vendor.category || '',
      contact_name: vendor.contact_name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      website: vendor.website || '',
      location: vendor.location || '',
      status: vendor.status,
      notes: vendor.notes || '',
      rating: vendor.rating || undefined,
      on_time_delivery: vendor.on_time_delivery || undefined,
      cost_score: vendor.cost_score || undefined,
      quality_score: vendor.quality_score || undefined,
    } : undefined,
  });

  if (!vendor) return null;

  const apSummary = apTransactions ? {
    totalOutstanding: apTransactions.filter(t => t.status === 'outstanding').reduce((sum, t) => sum + t.amount, 0),
    totalOverdue: apTransactions.filter(t => t.status === 'overdue').reduce((sum, t) => sum + t.amount, 0),
    openInvoices: apTransactions.filter(t => t.status !== 'paid').length,
  } : { totalOutstanding: 0, totalOverdue: 0, openInvoices: 0 };

  const onSubmit = async (data: VendorFormData) => {
    try {
      await updateVendor.mutateAsync({
        id: vendor.id,
        name: data.name,
        category: data.category || undefined,
        contact_name: data.contact_name || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        website: data.website || undefined,
        location: data.location || undefined,
        status: data.status || 'active',
        notes: data.notes || undefined,
        rating: data.rating,
        on_time_delivery: data.on_time_delivery,
        cost_score: data.cost_score,
        quality_score: data.quality_score,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVendor.mutateAsync(vendor.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              {vendor.name}
              <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                {vendor.status}
              </Badge>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this vendor? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {deleteVendor.isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
              <TabsTrigger value="ap-transactions">
                AP Transactions ({apSummary.openInvoices})
              </TabsTrigger>
              <TabsTrigger value="edit" disabled={!isEditing}>Edit</TabsTrigger>
            </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Category:</span>
                        <Badge variant="outline">{vendor.category || 'Not specified'}</Badge>
                      </div>
                      
                      {vendor.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{vendor.location}</span>
                        </div>
                      )}

                      {vendor.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {vendor.website}
                          </a>
                        </div>
                      )}
                    </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Overall Rating</h3>
                
                {vendor.rating ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-2xl font-bold">{vendor.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-500">out of 5</span>
                  </div>
                ) : (
                  <span className="text-gray-500">No rating available</span>
                )}
              </div>
            </div>

            {/* Notes */}
            {vendor.notes && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{vendor.notes}</p>
              </div>
            )}
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <VendorContactsManager 
              vendorId={vendor.id} 
              vendorName={vendor.name}
            />
          </TabsContent>

            {/* Purchase Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        ${purchaseMetrics.totalSpend.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Spend</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {purchaseMetrics.orderCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Orders</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        ${purchaseMetrics.averageOrderValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Order</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {purchaseMetrics.onTimeDeliveryRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">On-Time</div>
                    </CardContent>
                  </Card>
                </div>

                {isPurchaseLoading ? (
                  <div className="text-center py-4">Loading purchase history...</div>
                ) : purchaseOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No purchase orders found for this vendor
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Purchase Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {purchaseOrders.slice(0, 10).map((po) => (
                          <div key={po.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">{po.id.slice(0, 8)}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(po.order_date), 'MMM dd, yyyy')}
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="font-medium">${po.total_amount.toLocaleString()}</div>
                              <Badge variant={po.status === 'Delivered' ? 'default' : 'secondary'}>
                                {po.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vendor.on_time_delivery !== null && vendor.on_time_delivery !== undefined && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">On-Time Delivery</span>
                      <span className="text-lg font-bold">{vendor.on_time_delivery}%</span>
                    </div>
                    <Progress value={vendor.on_time_delivery} className="h-3" />
                  </div>
                )}

                {vendor.quality_score !== null && vendor.quality_score !== undefined && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Quality Score</span>
                      <span className="text-lg font-bold">{vendor.quality_score}%</span>
                    </div>
                    <Progress value={vendor.quality_score} className="h-3" />
                  </div>
                )}

                {vendor.cost_score !== null && vendor.cost_score !== undefined && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Cost Score</span>
                      <span className="text-lg font-bold">{vendor.cost_score}%</span>
                    </div>
                    <Progress value={vendor.cost_score} className="h-3" />
                  </div>
                )}

                {vendor.overall_score !== null && vendor.overall_score !== undefined && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Overall Score</span>
                      <span className="text-lg font-bold">{vendor.overall_score}%</span>
                    </div>
                    <Progress value={vendor.overall_score} className="h-3" />
                  </div>
                )}
              </div>

              {/* Show message if no performance data */}
              {(!vendor.on_time_delivery && !vendor.quality_score && !vendor.cost_score && !vendor.overall_score) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No performance metrics available</p>
                </div>
              )}
            </TabsContent>

            {/* AP Transactions Tab */}
            <TabsContent value="ap-transactions" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-amber-500" />
                      Outstanding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${apSummary.totalOutstanding.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-red-500" />
                      Overdue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">${apSummary.totalOverdue.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Open Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{apSummary.openInvoices}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>AP Transactions</CardTitle>
                  <CardDescription>All accounts payable transactions for this vendor</CardDescription>
                </CardHeader>
                <CardContent>
                  {apTransactions && apTransactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Transaction Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Attachments</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{transaction.invoice_number || 'N/A'}</TableCell>
                            <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                            <TableCell>{format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>
                              {transaction.due_date ? format(new Date(transaction.due_date), 'MMM dd, yyyy') : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                transaction.status === 'paid' ? 'default' :
                                transaction.status === 'overdue' ? 'destructive' : 'secondary'
                              }>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {transaction.attachments && transaction.attachments.length > 0 ? (
                                <div className="flex items-center space-x-1">
                                  <FileIcon className="h-4 w-4" />
                                  <span className="text-sm">{transaction.attachments.length}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">None</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No AP transactions found for this vendor
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {isEditing && (
            <TabsContent value="edit">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Same form fields as AddVendorDialog but with pre-filled values */}
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
                      <Select onValueChange={(value) => form.setValue('category', value)} defaultValue={vendor.category || ''}>
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

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={(value) => form.setValue('status', value)} defaultValue={vendor.status}>
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

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_name">Contact Name</Label>
                      <Input
                        id="contact_name"
                        {...form.register('contact_name')}
                        placeholder="Enter contact name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register('email')}
                        placeholder="Enter email"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...form.register('phone')}
                        placeholder="Enter phone number"
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

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...form.register('location')}
                        placeholder="City, State/Country"
                      />
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Performance Metrics (Optional)</h3>
                  <p className="text-sm text-muted-foreground">
                    All performance metrics are optional and can be updated as you track vendor performance.
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
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateVendor.isPending}>
                    {updateVendor.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </TabsContent>
            )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};