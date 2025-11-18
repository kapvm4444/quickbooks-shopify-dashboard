import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AddSKUDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SKUForm {
  sku: string;
  description: string;
  category: string;
  price: string;
  cost: string;
  quantity: string;
}

export const AddSKUDialog = ({ open, onOpenChange }: AddSKUDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState<SKUForm>({
    sku: '',
    description: '',
    category: 'Products',
    price: '',
    cost: '',
    quantity: '0',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    
    const isSample = form.category === 'Samples';
    
    // Validate required fields - price is optional for samples
    if (!form.sku || !form.description || !form.cost || (!isSample && !form.price)) {
      toast({
        title: "Validation Error",
        description: isSample ? "Please fill in SKU, description, and batch cost" : "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const price = isSample ? 0 : parseFloat(form.price);
      const cost = parseFloat(form.cost);
      const quantity = parseInt(form.quantity) || 0;

      // Create the original_row array in the expected format
      const originalRow = [
        form.sku,           // [0] SKU#
        form.description,   // [1] Description  
        form.category,      // [2] Category
        price.toString(),   // [3] Sale Price
        cost.toString(),    // [4] Cost
        quantity.toString(), // [5] Quantity
        'Active'           // [6] Status
      ];

      const { error } = await supabase
        .from('financial_records')
        .insert({
          record_type: 'sku',
          description: form.sku,
          amount: price,
          transaction_date: new Date().toISOString().split('T')[0],
          category: 'sku',
          source: 'manual_entry',
          user_id: user.id,
          metadata: {
            original_row: originalRow,
            product_name: form.description,
            cost_price: cost,
            quantity: quantity,
            status: 'Active'
          }
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "SKU added successfully",
      });

      // Reset form
      setForm({
        sku: '',
        description: '',
        category: 'Products',
        price: '',
        cost: '',
        quantity: '0',
      });

      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['financial-records'] });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding SKU:', error);
      toast({
        title: "Error",
        description: "Failed to add SKU: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New SKU</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sku" className="text-right">
              SKU# *
            </Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(e) => setForm({...form, sku: e.target.value})}
              className="col-span-3"
              placeholder="Enter SKU code"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Name *
            </Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="col-span-3"
              placeholder="Product name"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={form.category} onValueChange={(value) => setForm({...form, category: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Products">Products</SelectItem>
                <SelectItem value="Subscription">Subscription</SelectItem>
                <SelectItem value="Samples">Samples</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
                <SelectItem value="Home & Garden">Home & Garden</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {form.category !== 'Samples' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Sale Price *
              </Label>
               <Input
                 id="price"
                 type="number"
                 step="any"
                 value={form.price}
                 onChange={(e) => setForm({...form, price: e.target.value})}
                 className="col-span-3"
                 placeholder="0.00"
               />
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost" className="text-right">
              {form.category === 'Samples' ? 'Batch Cost *' : 'Unit Cost *'}
            </Label>
             <Input
               id="cost"
               type="number"
               step="any"
               value={form.cost}
               onChange={(e) => setForm({...form, cost: e.target.value})}
               className="col-span-3"
               placeholder="0.00"
             />
            {form.category === 'Samples' && (
              <p className="col-span-4 text-xs text-muted-foreground text-right">
                Cost for the entire sample batch
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              {form.category === 'Samples' ? 'Batch Size' : 'Quantity'}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={(e) => setForm({...form, quantity: e.target.value})}
              className="col-span-3"
              placeholder="0"
            />
            {form.category === 'Samples' && (
              <p className="col-span-4 text-xs text-muted-foreground text-right">
                Number of units in this sample batch
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add SKU"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};