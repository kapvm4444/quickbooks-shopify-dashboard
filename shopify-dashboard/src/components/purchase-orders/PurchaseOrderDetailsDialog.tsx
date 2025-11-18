import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Trash2, Edit, Save, X, Download, Eye, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileUpload, AttachmentFile } from "@/components/ui/file-upload";
import { PurchaseOrderLineItemsManager } from "./PurchaseOrderLineItemsManager";
import { useQueryClient } from "@tanstack/react-query";

interface PurchaseOrder {
  id: string;
  user_id: string;
  vendor_id?: string;
  po_number: string;
  vendor_name: string;
  order_date: string;
  delivery_date?: string;
  total_amount: number;
  payment_terms?: string;
  paid_to_date: number;
  items_count: number;
  status: string;
  notes?: string;
  attachments?: AttachmentFile[];
  created_at: string;
  updated_at: string;
}

interface PurchaseOrderDetailsDialogProps {
  purchaseOrder: PurchaseOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const PurchaseOrderDetailsDialog = ({ 
  purchaseOrder, 
  open, 
  onOpenChange, 
  onUpdate 
}: PurchaseOrderDetailsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    vendor_name: '',
    order_date: undefined as Date | undefined,
    delivery_date: undefined as Date | undefined,
    total_amount: '',
    payment_terms: '',
    paid_to_date: '',
    status: '',
    notes: ''
  });
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        vendor_name: purchaseOrder.vendor_name,
        order_date: purchaseOrder.order_date ? new Date(purchaseOrder.order_date) : undefined,
        delivery_date: purchaseOrder.delivery_date ? new Date(purchaseOrder.delivery_date) : undefined,
        total_amount: purchaseOrder.total_amount.toString(),
        payment_terms: purchaseOrder.payment_terms || '',
        paid_to_date: purchaseOrder.paid_to_date.toString(),
        status: purchaseOrder.status,
        notes: purchaseOrder.notes || ''
      });
      setAttachments(purchaseOrder.attachments || []);
    }
  }, [purchaseOrder]);

  const handleInputChange = (field: string, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!purchaseOrder) return;
    
    setIsSaving(true);
    const statusChanged = formData.status !== purchaseOrder.status;
    const wasDelivered = formData.status === 'Delivered' && purchaseOrder.status !== 'Delivered';
    
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({
          vendor_name: formData.vendor_name,
          order_date: formData.order_date?.toISOString().split('T')[0],
          delivery_date: formData.delivery_date?.toISOString().split('T')[0],
          total_amount: parseFloat(formData.total_amount) || 0,
          payment_terms: formData.payment_terms,
          paid_to_date: parseFloat(formData.paid_to_date) || 0,
          status: formData.status,
          notes: formData.notes,
          attachments: attachments as any
        })
        .eq('id', purchaseOrder.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: wasDelivered 
          ? "Purchase order delivered and inventory updated successfully."
          : "Purchase order updated successfully.",
      });

      setIsEditing(false);
      onUpdate();
      
      // If status changed, especially to delivered, invalidate inventory and SKU queries
      if (statusChanged) {
        // Invalidate all inventory and SKU related queries
        queryClient.invalidateQueries({ queryKey: ["financial-records"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-data"] });
        queryClient.invalidateQueries({ queryKey: ["skus"] });
        queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      }
    } catch (error) {
      console.error('Error updating purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to update purchase order.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (purchaseOrder) {
      setFormData({
        vendor_name: purchaseOrder.vendor_name,
        order_date: purchaseOrder.order_date ? new Date(purchaseOrder.order_date) : undefined,
        delivery_date: purchaseOrder.delivery_date ? new Date(purchaseOrder.delivery_date) : undefined,
        total_amount: purchaseOrder.total_amount.toString(),
        payment_terms: purchaseOrder.payment_terms || '',
        paid_to_date: purchaseOrder.paid_to_date.toString(),
        status: purchaseOrder.status,
        notes: purchaseOrder.notes || ''
      });
      setAttachments(purchaseOrder.attachments || []);
    }
    setIsEditing(false);
  };

  if (!purchaseOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Purchase Order Details - {purchaseOrder.po_number}</DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Purchase Order Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Information</h3>
            
            <div>
              <Label>Vendor Name</Label>
              {isEditing ? (
                <Input
                  value={formData.vendor_name}
                  onChange={(e) => handleInputChange('vendor_name', e.target.value)}
                />
              ) : (
                <p className="mt-1 text-sm">{purchaseOrder.vendor_name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Order Date</Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.order_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.order_date ? format(formData.order_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.order_date}
                        onSelect={(date) => handleInputChange('order_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <p className="mt-1 text-sm">
                    {purchaseOrder.order_date ? format(new Date(purchaseOrder.order_date), "PPP") : 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <Label>Delivery Date</Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.delivery_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.delivery_date ? format(formData.delivery_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.delivery_date}
                        onSelect={(date) => handleInputChange('delivery_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <p className="mt-1 text-sm">
                    {purchaseOrder.delivery_date ? format(new Date(purchaseOrder.delivery_date), "PPP") : 'Not set'}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Amount</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => handleInputChange('total_amount', e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm">${purchaseOrder.total_amount.toLocaleString()}</p>
                )}
              </div>

              <div>
                <Label>Paid to Date</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.paid_to_date}
                    onChange={(e) => handleInputChange('paid_to_date', e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm">${purchaseOrder.paid_to_date.toLocaleString()}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Terms</Label>
                {isEditing ? (
                  <Input
                    value={formData.payment_terms}
                    onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm">{purchaseOrder.payment_terms || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label>Status</Label>
                {isEditing ? (
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="In Production">In Production</SelectItem>
                      <SelectItem value="Tooling">Tooling</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 text-sm">{purchaseOrder.status}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              {isEditing ? (
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-sm">{purchaseOrder.notes || 'No notes'}</p>
              )}
            </div>

            {/* Attachments Section */}
            <div>
              <Label>Attachments</Label>
              {isEditing ? (
                <FileUpload
                  onFilesChange={setAttachments}
                  existingFiles={attachments}
                  maxFiles={5}
                />
              ) : (
                <div className="mt-2">
                  {attachments && attachments.length > 0 ? (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={file.id || index}
                          className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded border">
                              {file.type?.includes('image') ? (
                                <Eye className="w-4 h-4 text-blue-600" />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.type?.includes('image') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(file.url, '_blank')}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = file.url;
                                link.download = file.name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No attachments</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Line Items</h3>
            <PurchaseOrderLineItemsManager 
              purchaseOrderId={purchaseOrder.id}
              isEditing={isEditing}
              onTotalChange={(total) => handleInputChange('total_amount', total.toString())}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};