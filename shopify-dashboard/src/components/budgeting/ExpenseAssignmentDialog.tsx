import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Link, Unlink, Loader2 } from 'lucide-react';
import { useBudgetData, BudgetLineItem } from '@/hooks/useBudgetData';
import { useFinancialData } from '@/hooks/useFinancialData';
import { formatCurrency } from '@/utils/formatters/numberFormatters';
import { handleError, showErrorToUser } from '@/lib/error-handling';

interface ExpenseAssignmentDialogProps {
  lineItem: BudgetLineItem;
  children: React.ReactNode;
  onClose?: () => void;
}

export const ExpenseAssignmentDialog = ({ lineItem, children, onClose }: ExpenseAssignmentDialogProps) => {
  const [open, setOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [unallocatedExpenses, setUnallocatedExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { linkExpenseToLineItem, unlinkExpenseFromLineItem, getUnallocatedExpenses } = useBudgetData();
  const { financialRecords } = useFinancialData();

  // Validate lineItem data
  const validateLineItem = (item: BudgetLineItem) => {
    if (!item || typeof item !== 'object') {
      console.error('ExpenseAssignmentDialog: Invalid lineItem:', item);
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (open) {
      if (!validateLineItem(lineItem)) {
        setError('Invalid expense data. Please try again.');
        return;
      }
      loadUnallocatedExpenses();
    }
  }, [open]);

  const loadUnallocatedExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading unallocated expenses for lineItem:', lineItem);
      
      const expenses = await getUnallocatedExpenses();
      console.log('Fetched expenses:', expenses);
      setUnallocatedExpenses(expenses || []);
    } catch (err) {
      console.error('Error loading unallocated expenses:', err);
      const appError = handleError(err, {
        operation: 'loadUnallocatedExpenses',
        component: 'ExpenseAssignmentDialog'
      });
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkExpense = async (expenseId: string) => {
    try {
      console.log('Linking expense:', expenseId, 'to lineItem:', lineItem.id);
      await linkExpenseToLineItem(lineItem.id, expenseId);
      loadUnallocatedExpenses();
    } catch (err) {
      console.error('Error linking expense:', err);
      const appError = handleError(err, {
        operation: 'linkExpenseToLineItem',
        component: 'ExpenseAssignmentDialog'
      });
      setError('Failed to link expense. Please try again.');
    }
  };

  const handleUnlinkExpense = async (expenseId: string) => {
    try {
      console.log('Unlinking expense:', expenseId, 'from lineItem:', lineItem.id);
      await unlinkExpenseFromLineItem(lineItem.id, expenseId);
      loadUnallocatedExpenses();
    } catch (err) {
      console.error('Error unlinking expense:', err);
      const appError = handleError(err, {
        operation: 'unlinkExpenseFromLineItem',
        component: 'ExpenseAssignmentDialog'
      });
      setError('Failed to unlink expense. Please try again.');
    }
  };

  const filteredUnallocatedExpenses = unallocatedExpenses.filter(expense =>
    expense?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const linkedExpenses = financialRecords?.filter(record => 
    record?.record_type === 'expense' && 
    lineItem?.linked_expense_ids?.includes(record.id)
  ) || [];

  const calculateLinkedTotal = () => {
    return linkedExpenses.reduce((sum, expense) => sum + (expense?.amount || 0), 0);
  };

  // Safe access to lineItem amount - handle both old and new structure
  const getLineItemAmount = () => {
    return lineItem?.planned_amount || 0;
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log('Dialog open state changing:', newOpen);
    setOpen(newOpen);
    if (!newOpen && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Assign Expenses to Budget Line Item</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {lineItem.category} - {lineItem.description}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error State */}
          {error && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Currently Linked Expenses */}
          <div>
            <h3 className="text-lg font-medium mb-3">
              Currently Linked Expenses ({linkedExpenses.length})
            </h3>
            {linkedExpenses.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Total Linked Amount:</span>
                  <span className="font-bold text-green-700">
                    {formatCurrency(calculateLinkedTotal())}
                  </span>
                </div>
                <ScrollArea className="h-32">
                  {linkedExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-2 border rounded mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {expense.transaction_date} • {expense.category}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(expense.amount)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnlinkExpense(expense.id)}
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No expenses currently linked to this budget line item
              </div>
            )}
          </div>

          {/* Available Expenses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">
                Available Expenses ({loading ? '...' : filteredUnallocatedExpenses.length})
              </h3>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                  disabled={loading}
                />
              </div>
            </div>
            
            <ScrollArea className="h-64">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-muted-foreground">Loading expenses...</span>
                </div>
              ) : filteredUnallocatedExpenses.length > 0 ? (
                <div className="space-y-2">
                  {filteredUnallocatedExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {expense.transaction_date} • {expense.category}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(expense.amount)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLinkExpense(expense.id)}
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No expenses match your search' : 'All expenses are already allocated'}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Planned: {formatCurrency(getLineItemAmount())} | 
            Actual: {formatCurrency(calculateLinkedTotal())}
          </div>
          <Button onClick={() => handleOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};