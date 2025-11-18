import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, X, Repeat } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatters/numberFormatters";
import { FinancialRecord } from "@/types/business";
import { BulkRecurringEdit } from "@/components/expenses/BulkRecurringEdit";

interface UnifiedBulkEditPanelProps {
  selectedTransactions: FinancialRecord[];
  onSelectionChange: (transactions: FinancialRecord[]) => void;
  chartAccounts: Array<{ account_code: string; account_name: string }>;
  onRefresh: () => void;
}

export function UnifiedBulkEditPanel({ 
  selectedTransactions, 
  onSelectionChange, 
  chartAccounts,
  onRefresh 
}: UnifiedBulkEditPanelProps) {
  const [bulkEditData, setBulkEditData] = useState({
    payee: '',
    chartAccountCode: '',
    description: ''
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedCount = selectedTransactions.length;
  const totalValue = selectedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const clearSelection = () => {
    onSelectionChange([]);
  };

  const handleBulkEdit = async () => {
    if (selectedCount === 0) return;

    setIsProcessing(true);
    try {
      const updates: any = {};
      if (bulkEditData.payee) updates.payee = bulkEditData.payee;
      if (bulkEditData.chartAccountCode) {
        const account = chartAccounts.find(acc => acc.account_code === bulkEditData.chartAccountCode);
        if (account) updates.chart_account_name = account.account_name;
      }
      if (bulkEditData.description) updates.description = bulkEditData.description;

      if (Object.keys(updates).length === 0) {
        toast.error("Please select at least one field to update");
        return;
      }

      updates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('financial_records')
        .update(updates)
        .in('id', selectedTransactions.map(t => t.id));

      if (error) throw error;

      toast.success(`Successfully updated ${selectedCount} transaction(s)`);
      setIsBulkEditDialogOpen(false);
      setBulkEditData({ payee: '', chartAccountCode: '', description: '' });
      clearSelection();
      onRefresh();
    } catch (error: any) {
      toast.error("Failed to update transactions: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;

    setIsProcessing(true);
    try {
      console.log('Attempting bulk delete of transactions:', selectedTransactions.map(t => ({ id: t.id, is_recurring: t.is_recurring })));
      
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .in('id', selectedTransactions.map(t => t.id));

      if (error) {
        console.error('Bulk delete error:', error);
        throw error;
      }

      toast.success(`Successfully deleted ${selectedCount} transaction(s)`);
      setIsDeleteDialogOpen(false);
      clearSelection();
      onRefresh();
    } catch (error: any) {
      console.error('Failed bulk delete:', error);
      toast.error("Failed to delete transactions: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <Card className="mb-4 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">Bulk Actions</span>
            <Badge variant="secondary">{selectedCount} selected</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total value: {formatCurrency(totalValue)}
          </div>
          <div className="flex gap-2">
            <Dialog open={isBulkEditDialogOpen} onOpenChange={setIsBulkEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Bulk Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Bulk Edit {selectedCount} Transaction(s)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Customer/Payee (leave empty to keep unchanged)</label>
                    <Input
                      placeholder="Enter new customer/payee"
                      value={bulkEditData.payee}
                      onChange={(e) => setBulkEditData({...bulkEditData, payee: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Chart Account</label>
                    <Select
                      value={bulkEditData.chartAccountCode}
                      onValueChange={(value) => setBulkEditData({...bulkEditData, chartAccountCode: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {chartAccounts.map((account) => (
                          <SelectItem key={account.account_code} value={account.account_code}>
                            {account.account_code} - {account.account_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Input
                      placeholder="Enter new description"
                      value={bulkEditData.description}
                      onChange={(e) => setBulkEditData({...bulkEditData, description: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsBulkEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkEdit}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Updating..." : "Update All"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsRecurringDialogOpen(true)}
            >
              <Repeat className="h-4 w-4 mr-2" />
              Recurring
            </Button>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete {selectedCount} Transaction(s)?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. The selected transactions will be permanently deleted.
                </p>
                <p className="text-sm font-medium">
                  Total value to delete: {formatCurrency(totalValue)}
                </p>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleBulkDelete}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Deleting..." : "Delete All"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
      
      <BulkRecurringEdit
        open={isRecurringDialogOpen}
        onOpenChange={setIsRecurringDialogOpen}
        selectedTransactions={selectedTransactions}
        onSuccess={() => {
          clearSelection();
          onRefresh();
        }}
      />
    </Card>
  );
}